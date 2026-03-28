import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  EllipsisVertical,
  Flag,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  UserCircle2,
} from 'lucide-react';

interface ProjectComment {
  id: string;
  authorName: string;
  authorIcon?: string;
  text: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies: ProjectComment[];
}

interface ProjectCommentsProps {
  initialComments: ProjectComment[];
  currentUserName?: string;
  initialVisibleCount?: number;
  onCommentsChange?: (comments: ProjectComment[]) => void;
  onViewUserProfile?: (authorName: string) => void;
  onReportComment?: (commentId: string, authorName: string) => void;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || 'U';
}

function createComment(authorName: string, text: string): ProjectComment {
  return {
    id: crypto.randomUUID(),
    authorName,
    text,
    timestamp: 'Just now',
    likes: 0,
    dislikes: 0,
    replies: [],
  };
}

function updateCommentTree(
  comments: ProjectComment[],
  targetId: string,
  updater: (comment: ProjectComment) => ProjectComment,
): ProjectComment[] {
  return comments.map(comment => {
    if (comment.id === targetId) return updater(comment);
    if (comment.replies.length === 0) return comment;
    return {
      ...comment,
      replies: updateCommentTree(comment.replies, targetId, updater),
    };
  });
}

const REPORT_CATEGORIES = {
  'inappropriate': {
    label: 'Inappropriate/Offensive',
    reasons: [
      'Contains hate speech',
      'Sexually explicit or suggestive',
      'Graphic violence or injury',
      'Other inappropriate content',
    ],
  },
  'spam': {
    label: 'Spam',
    reasons: [
      'Promotional or advertising content',
      'Repeated/duplicate comments',
      'Irrelevant to discussion',
      'Links to suspicious sites',
    ],
  },
  'harassment': {
    label: 'Harassment',
    reasons: [
      'Targeted personal attacks',
      'Bullying or intimidation',
      'Doxxing or privacy violation',
      'Other harassment',
    ],
  },
  'misinformation': {
    label: 'Misinformation',
    reasons: [
      'False or misleading information',
      'Fact-checked as false',
      'Conspiracy theories',
      'Other misinformation',
    ],
  },
  'other': {
    label: 'Other',
    reasons: [
      'Copyright or intellectual property',
      'Self-harm or suicide',
      'Child safety concern',
      'General complaint',
    ],
  },
} as const;

interface ReportDialogProps {
  open: boolean;
  commentId: string | null;
  authorName: string | null;
  onClose: () => void;
  onSubmit: (category: string, reason: string) => void;
}

function ReportDialog({ open, commentId, authorName, onClose, onSubmit }: ReportDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [step, setStep] = useState(0);
  const [succeeded, setSucceeded] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedReason('');
  };

  const handleNext = () => {
    if (selectedCategory) {
      setStep(1);
    }
  };

  const handleBack = () => {
    setStep(0);
    setSelectedReason('');
  };

  const handleSubmit = () => {
    if (selectedCategory && selectedReason) {
      onSubmit(selectedCategory, selectedReason);
      setSucceeded(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setSelectedCategory('');
        setSelectedReason('');
        setStep(0);
        setSucceeded(false);
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    setSelectedCategory('');
    setSelectedReason('');
    setStep(0);
    setSucceeded(false);
    onClose();
  };

  if (!open || !commentId || !authorName) return null;

  const currentCategory = REPORT_CATEGORIES[selectedCategory as keyof typeof REPORT_CATEGORIES];
  const currentReasons = currentCategory?.reasons || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-xl bg-zinc-900/80 shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-zinc-950/50">
          <h2 className="text-sm font-semibold text-white">Report Comment</h2>
          <p className="text-xs text-zinc-400 mt-1">by {authorName}</p>
        </div>

        {/* Content - Sliding Steps or Success */}
        <div className="relative px-6 py-6 h-64 overflow-hidden flex items-center justify-center">
          {succeeded ? (
            // Success Message
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-3"
            >
              <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Report Submitted</p>
                <p className="text-xs text-zinc-400 mt-1">Thank you for helping keep our community safe</p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Step 1: Category Selection */}
              <motion.div
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: step === 0 ? 0 : -400, opacity: step === 0 ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 px-6 py-6"
              >
                <div className="space-y-3">
                  <p className="text-xs font-medium text-zinc-300 mb-4">Why are you reporting?</p>
                  {Object.entries(REPORT_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => handleCategorySelect(key)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        selectedCategory === key
                          ? 'bg-indigo-600/20 text-indigo-200'
                          : 'text-zinc-300 hover:text-zinc-100 hover:bg-white/5'
                      }`}
                    >
                      <p className="text-xs font-medium">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Step 2: Reason Selection */}
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: step === 1 ? 0 : 400, opacity: step === 1 ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 px-6 py-6"
              >
                <div className="space-y-3">
                  <p className="text-xs font-medium text-zinc-300 mb-4">Specific reason:</p>
                  {currentReasons.map(reason => (
                    <button
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        selectedReason === reason
                          ? 'bg-rose-600/20 text-rose-200'
                          : 'text-zinc-300 hover:text-zinc-100 hover:bg-white/5'
                      }`}
                    >
                      <p className="text-xs">{reason}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Footer */}
        {!succeeded && (
          <div className="px-6 py-4 bg-zinc-950/50 flex gap-2 justify-end border-t border-white/5">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-white/5 rounded transition-colors"
            >
              Cancel
            </button>
            {step === 0 && (
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedCategory}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
              >
                Next
              </button>
            )}
            {step === 1 && (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-white/5 rounded transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedReason}
                  className="px-3 py-1.5 text-xs font-medium bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                >
                  Submit Report
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: ProjectComment;
  depth: number;
  voteByComment: Record<string, 'like' | 'dislike'>;
  onVote: (commentId: string, vote: 'like' | 'dislike') => void;
  onReply: (commentId: string, text: string) => void;
  onViewUserProfile?: (authorName: string) => void;
  onReportComment?: (commentId: string, authorName: string) => void;
  reportDialog: { open: boolean; commentId: string | null; authorName: string | null };
  onReportOpen: (commentId: string, authorName: string) => void;
  onReportClose: () => void;
  onReportSubmit: (category: string, reason: string) => void;
}

function CommentItem({
  comment,
  depth,
  voteByComment,
  onVote,
  onReply,
  onViewUserProfile,
  onReportComment,
  reportDialog,
  onReportOpen,
  onReportClose,
  onReportSubmit,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const userVote = voteByComment[comment.id];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!actionsRef.current) return;
      if (actionsRef.current.contains(event.target as Node)) return;
      setShowActions(false);
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  return (
    <div className={`${depth > 0 ? 'ml-4 pl-3 border-l border-white/10' : ''} py-2`}>
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 shrink-0 rounded-full border border-white/20 bg-indigo-600/20 text-[10px] font-semibold text-indigo-200 grid place-items-center">
          {comment.authorIcon ?? initials(comment.authorName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-white truncate">{comment.authorName}</span>
              <span className="text-[10px] text-zinc-500">{comment.timestamp}</span>
            </div>

            <div ref={actionsRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowActions(prev => !prev)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
                aria-label="Comment options"
                aria-expanded={showActions}
              >
                <EllipsisVertical className="h-3.5 w-3.5" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-7 z-20 min-w-[170px] overflow-hidden rounded-md border border-white/15 bg-zinc-900 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      onViewUserProfile?.(comment.authorName);
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-zinc-200 hover:bg-white/10"
                  >
                    <UserCircle2 className="h-3.5 w-3.5 text-indigo-300" />
                    View User Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReportOpen(comment.id, comment.authorName);
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-rose-200 hover:bg-rose-500/15"
                  >
                    <Flag className="h-3.5 w-3.5 text-rose-300" />
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-300 break-words">{comment.text}</p>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onVote(comment.id, 'like')}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] transition-colors ${
                userVote === 'like' ? 'text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label="Like comment"
            >
              <ThumbsUp className="h-3 w-3" />
              {comment.likes}
            </button>
            <button
              type="button"
              onClick={() => onVote(comment.id, 'dislike')}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] transition-colors ${
                userVote === 'dislike' ? 'text-rose-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label="Dislike comment"
            >
              <ThumbsDown className="h-3 w-3" />
              {comment.dislikes}
            </button>

            <button
              type="button"
              onClick={() => setShowReplyInput(prev => !prev)}
              className="text-[10px] text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1"
            >
              <MessageCircle className="h-3 w-3" /> Reply
            </button>
          </div>
        </div>

      </div>

      {showReplyInput && (
        <div className="mt-2 flex items-center gap-2">
          <input
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = replyText.trim();
              if (!trimmed) return;
              onReply(comment.id, trimmed);
              setReplyText('');
              setShowReplyInput(false);
            }}
            className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-500"
          >
            Send
          </button>
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              voteByComment={voteByComment}
              onVote={onVote}
              onReply={onReply}
              onViewUserProfile={onViewUserProfile}
              onReportComment={onReportComment}
              reportDialog={reportDialog}
              onReportOpen={onReportOpen}
              onReportClose={onReportClose}
              onReportSubmit={onReportSubmit}
            />
          ))}
        </div>
      )}

      <ReportDialog
        open={reportDialog.open}
        commentId={reportDialog.commentId}
        authorName={reportDialog.authorName}
        onClose={onReportClose}
        onSubmit={onReportSubmit}
      />
    </div>
  );
}

export default function ProjectComments({
  initialComments,
  currentUserName = 'You',
  initialVisibleCount = 2,
  onCommentsChange,
  onViewUserProfile,
  onReportComment,
}: ProjectCommentsProps) {
  const [comments, setComments] = useState<ProjectComment[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [voteByComment, setVoteByComment] = useState<Record<string, 'like' | 'dislike'>>({}); 
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [reportDialog, setReportDialog] = useState<{ open: boolean; commentId: string | null; authorName: string | null }>({
    open: false,
    commentId: null,
    authorName: null,
  });

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    onCommentsChange?.(comments);
  }, [comments, onCommentsChange]);

  const visibleComments = useMemo(
    () => comments.slice(0, visibleCount),
    [comments, visibleCount],
  );

  const addTopLevelComment = () => {
    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    setComments(prev => [createComment(currentUserName, trimmed), ...prev]);
    setNewCommentText('');
    setVisibleCount(prev => Math.max(prev, initialVisibleCount));
  };

  const voteComment = (commentId: string, vote: 'like' | 'dislike') => {
    const previousVote = voteByComment[commentId];
    if (previousVote === vote) return;

    setComments(prev =>
      updateCommentTree(prev, commentId, c => {
        let likes = c.likes;
        let dislikes = c.dislikes;

        if (previousVote === 'like') likes = Math.max(0, likes - 1);
        if (previousVote === 'dislike') dislikes = Math.max(0, dislikes - 1);

        if (vote === 'like') likes += 1;
        if (vote === 'dislike') dislikes += 1;

        return { ...c, likes, dislikes };
      }),
    );

    setVoteByComment(prev => ({ ...prev, [commentId]: vote }));
  };

  const addReply = (commentId: string, text: string) => {
    setComments(prev =>
      updateCommentTree(prev, commentId, c => ({
        ...c,
        replies: [createComment(currentUserName, text), ...c.replies],
      })),
    );
  };

  const handleReportOpen = (commentId: string, authorName: string) => {
    setReportDialog({ open: true, commentId, authorName });
  };

  const handleReportClose = () => {
    setReportDialog({ open: false, commentId: null, authorName: null });
  };

  const handleReportSubmit = (category: string, reason: string) => {
    if (reportDialog.commentId && reportDialog.authorName) {
      console.log(`Report submitted for ${reportDialog.authorName}:`, { category, reason });
      // Call parent callback if provided
      onReportComment?.(reportDialog.commentId, reportDialog.authorName);
      setShowReportSuccess(true);
      setTimeout(() => setShowReportSuccess(false), 2200);
      handleReportClose();
    }
  };

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
      {showReportSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="absolute right-3 top-3 z-30 rounded-lg bg-emerald-500/15 px-3 py-2 text-[11px] font-medium text-emerald-200 shadow-lg ring-1 ring-emerald-400/30"
          role="status"
          aria-live="polite"
        >
          Report submitted successfully.
        </motion.div>
      )}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[12px] font-semibold text-zinc-200">Comments</h4>
        <span className="text-[10px] text-zinc-500">{comments.length} total</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input
          value={newCommentText}
          onChange={e => setNewCommentText(e.target.value)}
          placeholder="Add a comment"
          className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
        />
        <button
          type="button"
          onClick={addTopLevelComment}
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-500"
        >
          Post
        </button>
      </div>

      <div className="mt-2">
        {visibleComments.length === 0 ? (
          <p className="text-[11px] text-zinc-500">No comments yet. Start the conversation.</p>
        ) : (
          visibleComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              voteByComment={voteByComment}
              onVote={voteComment}
              onReply={addReply}
              onViewUserProfile={onViewUserProfile}
              onReportComment={onReportComment}
              reportDialog={reportDialog}
              onReportOpen={handleReportOpen}
              onReportClose={handleReportClose}
              onReportSubmit={handleReportSubmit}
            />
          ))
        )}
      </div>

      {comments.length > visibleCount && (
        <button
          type="button"
          onClick={() => setVisibleCount(prev => prev + initialVisibleCount)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
        >
          <ChevronDown className="h-3 w-3" />
          Show more comments
        </button>
      )}
    </div>
  );
}

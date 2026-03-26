import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';

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

interface CommentItemProps {
  comment: ProjectComment;
  depth: number;
  voteByComment: Record<string, 'like' | 'dislike'>;
  onVote: (commentId: string, vote: 'like' | 'dislike') => void;
  onReply: (commentId: string, text: string) => void;
}

function CommentItem({ comment, depth, voteByComment, onVote, onReply }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const userVote = voteByComment[comment.id];

  return (
    <div className={`${depth > 0 ? 'ml-4 pl-3 border-l border-white/10' : ''} py-2`}>
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 shrink-0 rounded-full border border-white/20 bg-indigo-600/20 text-[10px] font-semibold text-indigo-200 grid place-items-center">
          {comment.authorIcon ?? initials(comment.authorName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-white truncate">{comment.authorName}</span>
            <span className="text-[10px] text-zinc-500">{comment.timestamp}</span>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectComments({
  initialComments,
  currentUserName = 'You',
  initialVisibleCount = 2,
  onCommentsChange,
}: ProjectCommentsProps) {
  const [comments, setComments] = useState<ProjectComment[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [voteByComment, setVoteByComment] = useState<Record<string, 'like' | 'dislike'>>({});

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

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
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

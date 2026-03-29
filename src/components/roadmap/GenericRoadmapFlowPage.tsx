import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Node,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Code2,
  X,
  Zap,
  Github,
  Send,
  Link2,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Trash2,
  Trophy,
  Lock,
  ArrowRight,
  ChevronUp,
  Loader2,
  Building2,
  MapPin,
  ExternalLink,
  DollarSign,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import axios from 'axios';

import { nodeTypes } from '@/components/roadmap/RoadmapFlowNodes';
import Footer from '@/components/Footer';
import NodeDetailSidebar from '@/components/roadmap/NodeDetailSidebar';
import PrivacyWarningModal from '@/components/roadmap/PrivacyWarningModal';
import ProjectComments from '@/components/roadmap/ProjectComments';
import { BACKEND_URL } from '@/config/env';
import { SECTION_NODE_MAP, ALL_NODE_DETAILS } from '@/data/allNodeDetails';
import type { RoadmapFlowConfig, RoadmapNodeData } from '@/types/roadmapFlow';

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

interface Submission {
  id: string;
  projectId: string;
  url: string;
  date: string;
  isPublic?: boolean;
  comments?: ProjectComment[];
}

interface PrivacyChangeRequest {
  open: boolean;
  targetVisibility: boolean;
  submissionId: string | null;
  scope: 'form' | 'submission';
}

interface JobMatch {
  id: string;
  title: string;
  company_name: string;
  location: string;
  type: string;
  salary?: string | null;
  url: string;
  source?: string;
  matchPercentage: number;
  matchReason?: string;
  savedCount?: number;
}

interface GenericRoadmapFlowPageProps {
  config: RoadmapFlowConfig;
}

function formatIndianLakhSalary(salary?: string | null): string {
  if (!salary) return 'Salary not disclosed';

  const normalizedSalary = String(salary).trim();
  if (!normalizedSalary) return 'Salary not disclosed';

  return normalizedSalary.replace(/\d[\d,]*(?:\.\d+)?/g, (match) => {
    const numericValue = Number(match.replace(/,/g, ''));

    if (!Number.isFinite(numericValue) || numericValue < 100000) {
      return match;
    }

    const lakhValue = numericValue / 100000;
    const display = Number.isInteger(lakhValue)
      ? String(lakhValue)
      : lakhValue.toFixed(1).replace(/\.0$/, '');

    return `${display}L`;
  });
}

function getSeededSaveCount(jobId: string): number {
  let hash = 0;
  for (let i = 0; i < jobId.length; i += 1) {
    hash = ((hash << 5) - hash) + jobId.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 90) + 10;
}

const LIKE_POP_PARTICLES = [
  { x: -24, y: -14, color: '#fb7185', size: 5, delay: 0.0 },
  { x: -14, y: -24, color: '#f59e0b', size: 4, delay: 0.02 },
  { x: 0, y: -28, color: '#22d3ee', size: 4, delay: 0.04 },
  { x: 14, y: -24, color: '#a78bfa', size: 5, delay: 0.06 },
  { x: 24, y: -14, color: '#34d399', size: 4, delay: 0.08 },
  { x: 20, y: 0, color: '#f472b6', size: 4, delay: 0.1 },
  { x: -20, y: 0, color: '#60a5fa', size: 4, delay: 0.12 },
];

export default function GenericRoadmapFlowPage({ config }: GenericRoadmapFlowPageProps) {
  const navigate = useNavigate();

  const canvasWidth = config.canvasWidth ?? 1040;
  const canvasHeight = config.canvasHeight ?? 2700;
  const NODE_LAZY_PRELOAD_PX = 180;
  const NODE_LAZY_BUCKET_PX = 80;
  const NODE_LAZY_REVEAL_STEP_PX = 80;

  const defaultViewport = useMemo(() => ({ x: 0, y: 20, zoom: 1 }), []);
  const reactFlowProOptions = useMemo(() => ({ hideAttribution: true }), []);
  const roadmapCanvasStyle = useMemo(
    () => ({ width: canvasWidth, height: canvasHeight, position: 'relative' as const, margin: '0 auto' }),
    [canvasWidth, canvasHeight],
  );
  const reactFlowStyle = useMemo(
    () => ({ width: canvasWidth, height: canvasHeight, background: 'transparent' }),
    [canvasWidth, canvasHeight],
  );

  const modules = {
    projects: true,
    comments: true,
    privacyWarning: true,
    careerSupport: true,
    jobMatches: true,
    faq: true,
    lockGate: false,
    ...config.modules,
  };

  const projects = config.projects;
  const faqs = config.faqs;
  const careerFeatures = config.careerSupportFeatures ?? [];
  const nodeDetails = config.nodeDetails ?? {};

  const IconComponent = Code2;

  const [nodes, setNodes, onNodesChange] = useNodesState(config.flowNodes);
  const [edges, , onEdgesChange] = useEdgesState(config.flowEdges);
  const [selected, setSelected] = useState<Node<RoadmapNodeData> | null>(null);
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);
  const [flowLazyCutoffY, setFlowLazyCutoffY] = useState(0);
  const [flowLazyTargetCutoffY, setFlowLazyTargetCutoffY] = useState(0);
  const [secondarySectionVisibility, setSecondarySectionVisibility] = useState({
    projects: false,
    career: false,
    faq: false,
  });
  const sectionCollapseEnabled = config.sectionCollapseEnabled ?? true;
  const defaultCollapsedSectionIds = config.defaultCollapsedSectionIds ?? [];
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(defaultCollapsedSectionIds.filter((sectionId) => config.mainSectionIds.includes(sectionId))),
  );

  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id ?? '');
  const [githubUrl, setGithubUrl] = useState('');
  const [isProjectPublic, setIsProjectPublic] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitAction, setSubmitAction] = useState<'created' | 'updated' | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<JobMatch[]>([]);
  const [jobMatchesLoading, setJobMatchesLoading] = useState(false);
  const [jobMatchesError, setJobMatchesError] = useState('');
  const [isJobMatchesExpanded, setIsJobMatchesExpanded] = useState(false);
  const [hasFetchedJobMatches, setHasFetchedJobMatches] = useState(false);
  const [likedJobIds, setLikedJobIds] = useState<Record<string, boolean>>({});
  const [likeBurst, setLikeBurst] = useState<{ jobId: string; nonce: number } | null>(null);
  const [privacyChangeRequest, setPrivacyChangeRequest] = useState<PrivacyChangeRequest>({
    open: false,
    targetVisibility: false,
    submissionId: null,
    scope: 'form',
  });

  useEffect(() => {
    setFlowLazyCutoffY(0);
    setFlowLazyTargetCutoffY(0);
    setSecondarySectionVisibility({ projects: false, career: false, faq: false });
  }, [config.roadmapKey]);

  useEffect(() => {
    if (flowLazyCutoffY >= flowLazyTargetCutoffY) return;

    let rafId = 0;

    const revealNextChunk = () => {
      rafId = 0;
      startTransition(() => {
        setFlowLazyCutoffY((prev) => {
          if (prev >= flowLazyTargetCutoffY) {
            return prev;
          }

          return Math.min(prev + NODE_LAZY_REVEAL_STEP_PX, flowLazyTargetCutoffY);
        });
      });
    };

    rafId = window.requestAnimationFrame(revealNextChunk);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [flowLazyCutoffY, flowLazyTargetCutoffY, NODE_LAZY_REVEAL_STEP_PX]);

  useEffect(() => {
    if (!modules.projects || secondarySectionVisibility.projects) return;

    const triggerEl = projectsTriggerRef.current;
    if (!triggerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setSecondarySectionVisibility((prev) =>
          prev.projects ? prev : { ...prev, projects: true },
        );
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: '550px 0px',
        threshold: 0,
      },
    );

    observer.observe(triggerEl);
    return () => observer.disconnect();
  }, [modules.projects, secondarySectionVisibility.projects]);

  useEffect(() => {
    if (!modules.careerSupport || secondarySectionVisibility.career) return;
    if (modules.projects && !secondarySectionVisibility.projects) return;

    const triggerEl = careerTriggerRef.current;
    if (!triggerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setSecondarySectionVisibility((prev) =>
          prev.career ? prev : { ...prev, career: true },
        );
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: '550px 0px',
        threshold: 0,
      },
    );

    observer.observe(triggerEl);
    return () => observer.disconnect();
  }, [
    modules.careerSupport,
    modules.projects,
    secondarySectionVisibility.career,
    secondarySectionVisibility.projects,
  ]);

  useEffect(() => {
    if (!modules.faq || secondarySectionVisibility.faq) return;
    if (modules.projects && !secondarySectionVisibility.projects) return;
    if (modules.careerSupport && !secondarySectionVisibility.career) return;

    const triggerEl = faqTriggerRef.current;
    if (!triggerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setSecondarySectionVisibility((prev) =>
          prev.faq ? prev : { ...prev, faq: true },
        );
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: '550px 0px',
        threshold: 0,
      },
    );

    observer.observe(triggerEl);
    return () => observer.disconnect();
  }, [
    modules.faq,
    modules.projects,
    modules.careerSupport,
    secondarySectionVisibility.faq,
    secondarySectionVisibility.projects,
    secondarySectionVisibility.career,
  ]);

  useEffect(() => {
    if (!sectionCollapseEnabled) {
      setCollapsedSections(new Set());
      return;
    }

    setCollapsedSections(
      new Set(defaultCollapsedSectionIds.filter((sectionId) => config.mainSectionIds.includes(sectionId))),
    );
  }, [sectionCollapseEnabled, defaultCollapsedSectionIds, config.mainSectionIds]);

  const selectedProjectSubmission = useMemo(
    () => submissions.find((sub) => sub.projectId === selectedProject),
    [submissions, selectedProject],
  );

  const requestPrivacyChange = (
    scope: 'form' | 'submission',
    targetVisibility: boolean,
    submissionId: string | null = null,
  ) => {
    if (!modules.privacyWarning) {
      if (scope === 'form') {
        setIsProjectPublic(targetVisibility);
        setSubmissions((prev) =>
          prev.map((s) =>
            s.projectId === selectedProject ? { ...s, isPublic: targetVisibility } : s,
          ),
        );
      }

      if (scope === 'submission' && submissionId) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId ? { ...s, isPublic: targetVisibility } : s,
          ),
        );
      }
      return;
    }

    setPrivacyChangeRequest({
      open: true,
      targetVisibility,
      submissionId,
      scope,
    });
  };

  const closePrivacyModal = () => {
    setPrivacyChangeRequest((prev) => ({ ...prev, open: false }));
  };

  const confirmPrivacyChange = () => {
    const { scope, targetVisibility, submissionId } = privacyChangeRequest;

    if (scope === 'form') {
      setIsProjectPublic(targetVisibility);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.projectId === selectedProject ? { ...s, isPublic: targetVisibility } : s,
        ),
      );
    }

    if (scope === 'submission' && submissionId) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId ? { ...s, isPublic: targetVisibility } : s,
        ),
      );
    }

    setPrivacyChangeRequest((prev) => ({ ...prev, open: false }));
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setSubmitAction(null);

    if (!selectedProject) {
      setSubmitError('Select a project before submitting.');
      return;
    }

    const trimmed = githubUrl.trim();
    if (!trimmed) {
      setSubmitError('Please enter a GitHub repository URL.');
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname.includes('github.com')) {
        setSubmitError('URL must be a github.com link.');
        return;
      }
    } catch {
      setSubmitError('Please enter a valid URL.');
      return;
    }

    const existingSubmission = submissions.find((s) => s.projectId === selectedProject);

    setSubmissions((prev) => {
      if (existingSubmission) {
        return prev.map((s) =>
          s.projectId === selectedProject
            ? {
                ...s,
                url: trimmed,
                isPublic: isProjectPublic,
                date: new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
              }
            : s,
        );
      }

      return [
        {
          id: crypto.randomUUID(),
          projectId: selectedProject,
          url: trimmed,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          isPublic: isProjectPublic,
          comments: [],
        },
        ...prev,
      ];
    });

    setSubmitAction(existingSubmission ? 'updated' : 'created');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3500);
  };

  useEffect(() => {
    if (selectedProjectSubmission) {
      setGithubUrl(selectedProjectSubmission.url);
      setIsProjectPublic(Boolean(selectedProjectSubmission.isPublic));
      return;
    }

    setGithubUrl('');
    setIsProjectPublic(false);
  }, [selectedProjectSubmission]);

  const [showLegend, setShowLegend] = useState(true);
  const [sidebar, setSidebar] = useState<{ open: boolean; sectionId: string | null; activeNodeId: string | null }>({
    open: false,
    sectionId: null,
    activeNodeId: null,
  });

  const roadmapCanvasRef = useRef<HTMLDivElement>(null);
  const roadmapScrollContainerRef = useRef<HTMLDivElement>(null);
  const projectsTriggerRef = useRef<HTMLDivElement>(null);
  const careerTriggerRef = useRef<HTMLDivElement>(null);
  const faqTriggerRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const jobMatchesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = roadmapScrollContainerRef.current;
    const roadmapCanvas = roadmapCanvasRef.current;
    if (!roadmapCanvas) return;

    let rafId = 0;
    let canvasPageTop = 0;

    const measureCanvasTop = () => {
      canvasPageTop = roadmapCanvas.getBoundingClientRect().top + window.scrollY;
    };

    const updateCutoff = () => {
      rafId = 0;
      const viewportBottom = window.scrollY + window.innerHeight + NODE_LAZY_PRELOAD_PX;
      const viewportCutoff = viewportBottom - canvasPageTop;

      const hasContainerScroll =
        !!container && (container.scrollHeight - container.clientHeight > 24);
      const containerCutoff = hasContainerScroll
        ? container.scrollTop + container.clientHeight + NODE_LAZY_PRELOAD_PX
        : 0;

      const nextCutoff = Math.max(0, Math.min(
        canvasHeight + NODE_LAZY_PRELOAD_PX,
        Math.max(viewportCutoff, containerCutoff),
      ));
      const bucketedCutoff =
        Math.ceil(nextCutoff / NODE_LAZY_BUCKET_PX) * NODE_LAZY_BUCKET_PX;

      startTransition(() => {
        setFlowLazyTargetCutoffY((prev) => (bucketedCutoff > prev ? bucketedCutoff : prev));
      });
    };

    const onScrollOrResize = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateCutoff);
    };

    const onResize = () => {
      measureCanvasTop();
      onScrollOrResize();
    };

    measureCanvasTop();
    updateCutoff();

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onResize);
    container?.addEventListener('scroll', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onResize);
      container?.removeEventListener('scroll', onScrollOrResize);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [config.roadmapKey, canvasHeight, NODE_LAZY_PRELOAD_PX, NODE_LAZY_BUCKET_PX]);

  const fetchRoadmapJobMatches = useCallback(async () => {
    if (jobMatchesLoading || !modules.jobMatches) return;

    try {
      setJobMatchesLoading(true);
      setJobMatchesError('');

      const roadmapMatchesPath = `/api/jobs/roadmap-matches?roadmap=${encodeURIComponent(config.roadmapKey)}&limit=${config.jobMatchesLimit ?? 18}`;
      const candidateBaseUrls = [...new Set([
        BACKEND_URL,
        '',
        'http://localhost:8081',
      ].map((url) => url.trim()))];

      let responseData: { recommendations?: unknown } | null = null;
      let lastError: unknown = null;

      for (const baseUrl of candidateBaseUrls) {
        const requestUrl = `${baseUrl}${roadmapMatchesPath}`;
        try {
          const apiResponse = await axios.get<{ recommendations?: unknown }>(requestUrl, { timeout: 12000 });
          responseData = apiResponse.data;
          break;
        } catch (requestError) {
          lastError = requestError;
        }
      }

      if (!responseData) {
        throw lastError ?? new Error('No reachable job matches endpoint.');
      }

      const rawRecommendations = Array.isArray(responseData.recommendations)
        ? responseData.recommendations
        : [];

      const recommendations = rawRecommendations
        .filter((job): job is JobMatch => (
          Boolean(job) &&
          typeof job === 'object' &&
          typeof job.url === 'string' &&
          typeof job.title === 'string'
        ))
        .filter((job, index, list) => {
          const currentKey = `${job.id ?? ''}|${job.url}|${job.title}`;
          return list.findIndex((item) => `${item.id ?? ''}|${item.url}|${item.title}` === currentKey) === index;
        });

      setMatchedJobs(recommendations);
      setHasFetchedJobMatches(true);
    } catch (error) {
      console.error('Error fetching roadmap job matches:', error);

      const serverError = axios.isAxiosError(error)
        ? error.response?.data?.error
        : null;
      const parsedServerError = typeof serverError === 'string' ? serverError : '';
      const fallbackError = error instanceof Error ? error.message : '';
      const errorMessage = parsedServerError || fallbackError || 'Unable to load matched jobs right now. Please try again.';

      setJobMatchesError(errorMessage);
    } finally {
      setJobMatchesLoading(false);
    }
  }, [jobMatchesLoading, modules.jobMatches, config.roadmapKey, config.jobMatchesLimit]);

  const handleCareerFeatureAction = useCallback(
    async (featureId: string) => {
      const feature = careerFeatures.find((item) => item.id === featureId);
      if (!feature) return;

      if (feature.actionType === 'navigate' && feature.actionTarget) {
        navigate(feature.actionTarget);
        return;
      }

      if (feature.actionType === 'job-matches') {
        if (!modules.jobMatches) return;
        setIsJobMatchesExpanded(true);
        setTimeout(() => {
          jobMatchesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);

        if (!hasFetchedJobMatches) {
          await fetchRoadmapJobMatches();
        }
        return;
      }

      if (feature.id === 'mentor-sessions' && config.mentorRoute) {
        navigate(config.mentorRoute);
        return;
      }

      if (feature.id === 'interview-prep') {
        navigate('/practice');
        return;
      }

      if (feature.id !== 'recommended-jobs' || !modules.jobMatches) return;

      setIsJobMatchesExpanded(true);
      setTimeout(() => {
        jobMatchesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);

      if (!hasFetchedJobMatches) {
        await fetchRoadmapJobMatches();
      }
    },
    [
      careerFeatures,
      navigate,
      config.mentorRoute,
      hasFetchedJobMatches,
      fetchRoadmapJobMatches,
      modules.jobMatches,
    ],
  );

  const completedNodeIds = useMemo(() => {
    const completedIds = new Set<string>();
    for (const node of nodes) {
      if (node.data.completed) {
        completedIds.add(node.id);
      }
    }
    return completedIds;
  }, [nodes]);

  const alwaysVisibleNodeIds = useMemo(() => {
    const ids = new Set<string>([...config.mainNodeIds, ...config.mainSectionIds]);

    for (const node of nodes) {
      if (node.type === 'startNode' || node.type === 'infoCard') {
        ids.add(node.id);
      }
    }

    return ids;
  }, [config.mainNodeIds, config.mainSectionIds, nodes]);

  const lazyHiddenNodeIds = useMemo(() => {
    const hiddenIds = new Set<string>();

    for (const node of nodes) {
      if (alwaysVisibleNodeIds.has(node.id)) continue;
      if ((node.position?.y ?? 0) > flowLazyCutoffY) {
        hiddenIds.add(node.id);
      }
    }

    return hiddenIds;
  }, [nodes, alwaysVisibleNodeIds, flowLazyCutoffY]);

  const visibleNodes = useMemo(() => {
    const useCollapseVisibility = sectionCollapseEnabled && collapsedSections.size > 0;

    return nodes.map((node) => {
      const sectionId = SECTION_NODE_MAP[node.id];
      const hiddenByCollapse = useCollapseVisibility && Boolean(sectionId) && sectionId !== node.id
        ? collapsedSections.has(sectionId)
        : false;
      const hiddenByLazy = lazyHiddenNodeIds.has(node.id);
      const shouldHide = hiddenByCollapse || hiddenByLazy;

      return node.hidden === shouldHide ? node : { ...node, hidden: shouldHide };
    });
  }, [nodes, sectionCollapseEnabled, collapsedSections, lazyHiddenNodeIds]);

  const hiddenNodeIds = useMemo(() => {
    const hiddenIds = new Set<string>();
    for (const node of visibleNodes) {
      if (node.hidden) {
        hiddenIds.add(node.id);
      }
    }
    return hiddenIds;
  }, [visibleNodes]);

  const visibleEdges = useMemo(() => {
    if (!sectionCollapseEnabled || hiddenNodeIds.size === 0) {
      return edges;
    }

    return edges.map((edge) => {
      const shouldHide = hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target);
      return edge.hidden === shouldHide ? edge : { ...edge, hidden: shouldHide };
    });
  }, [edges, sectionCollapseEnabled, hiddenNodeIds]);

  const nodeLabelById = useMemo(() => {
    const labels = new Map<string, string>();
    for (const node of nodes) {
      labels.set(node.id, node.data.label);
    }
    return labels;
  }, [nodes]);

  const sectionControls = useMemo(
    () => config.mainSectionIds.map((id) => ({
      id,
      label: nodeLabelById.get(id) ?? id,
      collapsed: collapsedSections.has(id),
    })),
    [config.mainSectionIds, nodeLabelById, collapsedSections],
  );

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const collapseAllSections = useCallback(() => {
    setCollapsedSections(new Set(config.mainSectionIds));
  }, [config.mainSectionIds]);

  const expandAllSections = useCallback(() => {
    setCollapsedSections(new Set());
  }, []);

  const completedSectionCount = useMemo(
    () => config.mainSectionIds.reduce(
      (count, id) => count + (completedNodeIds.has(id) ? 1 : 0),
      0,
    ),
    [config.mainSectionIds, completedNodeIds],
  );

  const isProjectsLocked =
    modules.lockGate && completedSectionCount < config.mainSectionIds.length;

  useEffect(() => {
    const roadmapEl = roadmapCanvasRef.current;
    const projectsEl = projectsRef.current;

    if (!roadmapEl) return;

    if (!projectsEl || !modules.projects || !secondarySectionVisibility.projects) {
      setShowLegend(true);
      return;
    }

    let roadmapVisible = false;
    let projectsVisible = false;

    const updateLegend = () => {
      setShowLegend(roadmapVisible && !projectsVisible);
    };

    const roadmapObserver = new IntersectionObserver(
      ([entry]) => {
        roadmapVisible = entry.isIntersecting;
        updateLegend();
      },
      { threshold: 0 },
    );

    const projectsObserver = new IntersectionObserver(
      ([entry]) => {
        projectsVisible = entry.isIntersecting;
        updateLegend();
      },
      { threshold: 0 },
    );

    roadmapObserver.observe(roadmapEl);
    projectsObserver.observe(projectsEl);

    return () => {
      roadmapObserver.disconnect();
      projectsObserver.disconnect();
    };
  }, [modules.projects, secondarySectionVisibility.projects]);

  useEffect(() => {
    if (!likeBurst) return;
    const timer = setTimeout(() => setLikeBurst(null), 700);
    return () => clearTimeout(timer);
  }, [likeBurst]);

  const toggleFaq = (id: string) =>
    setOpenFaqs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onNodeClick: NodeMouseHandler = useCallback(
    (_evt, node) => {
      if (node.type === 'startNode' || node.type === 'infoCard') return;

      const sectionId = SECTION_NODE_MAP[node.id];
      if (sectionId) {
        setSidebar((prev) =>
          prev.open && prev.activeNodeId === node.id
            ? { open: false, sectionId: null, activeNodeId: null }
            : { open: true, sectionId, activeNodeId: node.id },
        );
        return;
      }

      if (nodeDetails[node.id]) {
        setSelected((prev) => (prev?.id === node.id ? null : node));
      }
    },
    [nodeDetails],
  );

  const completedMain = useMemo(
    () => config.mainNodeIds.reduce(
      (count, id) => count + (completedNodeIds.has(id) ? 1 : 0),
      0,
    ),
    [config.mainNodeIds, completedNodeIds],
  );

  const progressPct = Math.round((completedMain / Math.max(config.mainNodeIds.length, 1)) * 100);

  const activeBreadcrumbLabel = useMemo(() => {
    if (sidebar.activeNodeId) {
      return nodeLabelById.get(sidebar.activeNodeId) ?? selected?.data.label ?? 'Interactive Diagram';
    }

    return selected?.data.label ?? 'Interactive Diagram';
  }, [sidebar.activeNodeId, nodeLabelById, selected]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      <div
        className="sticky top-0 z-20 backdrop-blur-md border-b border-white/10 dark:border-zinc-700/60"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)' }}
        />

        <div className="px-5 py-3 flex items-center gap-4 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/roadmaps')}
            className="gap-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors px-2.5"
          >
            <ArrowLeft size={15} />
            <span className="text-xs font-medium">Back</span>
          </Button>

          <div className="h-8 w-px bg-zinc-700" />

          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              <IconComponent size={18} className="text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase">
                <button
                  onClick={() => navigate('/')}
                  className="text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight size={10} className="text-zinc-600" />
                <button
                  onClick={() => navigate('/roadmaps')}
                  className="text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Roadmaps
                </button>
                <ChevronRight size={10} className="text-zinc-600" />
                <button
                  onClick={() => navigate(config.detailRoute)}
                  className="text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {config.breadcrumbLabel}
                </button>
                <ChevronRight size={10} className="text-zinc-600" />
                <span className="text-blue-400">{activeBreadcrumbLabel}</span>
              </div>
              <span className="font-semibold text-white text-sm leading-tight">{config.title}</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <CheckSquare size={13} className="text-emerald-400" />
                <span className="text-xs font-semibold text-white">
                  {completedMain}
                  <span className="text-zinc-500 font-normal"> / {config.mainNodeIds.length}</span>
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">topics complete</span>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div className="w-36 h-2 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background:
                        progressPct === 100
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      boxShadow: progressPct > 0 ? '0 0 6px rgba(139,92,246,0.6)' : 'none',
                    }}
                  />
                </div>
                <span
                  className="text-xs font-bold min-w-[2.5rem] text-right"
                  style={{
                    color:
                      progressPct === 100
                        ? '#34d399'
                        : progressPct > 50
                        ? '#8b5cf6'
                        : '#60a5fa',
                  }}
                >
                  {progressPct}%
                </span>
              </div>
              {progressPct === 100 && (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Zap size={10} /> Complete!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={roadmapScrollContainerRef}
        className="flex-1 min-h-0 overflow-x-auto overflow-y-auto"
        style={{
          backgroundColor: 'var(--roadmap-bg, #f9fafb)',
          backgroundImage: 'radial-gradient(circle, var(--roadmap-dot, #d1d5db) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div
          ref={roadmapCanvasRef}
          style={roadmapCanvasStyle}
        >
          <ReactFlow
            nodes={visibleNodes}
            edges={visibleEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onlyRenderVisibleElements
            fitView={false}
            defaultViewport={defaultViewport}
            panOnDrag={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={reactFlowProOptions}
            style={reactFlowStyle}
          />
        </div>
      </div>

      <div ref={projectsTriggerRef} className="h-px w-full" />

      {secondarySectionVisibility.projects && modules.projects && (
        <div
          ref={projectsRef}
          className="w-full py-20 px-4"
          style={{
            background: 'linear-gradient(180deg, #09090b 0%, #0d1117 60%, #09090b 100%)',
            borderTop: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div className="max-w-5xl mx-auto">
            {isProjectsLocked ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center gap-6 py-24"
              >
                <div
                  className="flex items-center justify-center w-20 h-20 rounded-2xl
                              bg-gradient-to-br from-indigo-500/15 to-purple-600/10
                              border border-indigo-500/25 shadow-xl shadow-indigo-500/10"
                >
                  <Lock className="w-9 h-9 text-indigo-400" />
                </div>

                <div className="text-center max-w-md">
                  <h3 className="text-xl font-bold text-white mb-2">Projects are Locked</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Complete all{' '}
                    <span className="text-indigo-300 font-semibold">
                      {config.mainSectionIds.length} roadmap sections
                    </span>{' '}
                    to unlock hands-on projects and demonstrate your skills.
                  </p>
                </div>

                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span>Your progress</span>
                    <span className="text-indigo-300 font-medium">
                      {completedSectionCount}&nbsp;/&nbsp;{config.mainSectionIds.length} sections
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 border border-white/8 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(completedSectionCount / config.mainSectionIds.length) * 100}%`,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-14">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-3">
                    <FolderGit2 className="w-3.5 h-3.5" />
                    {config.uiText?.projectSectionKicker ?? 'Hands-on Practice'}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {config.uiText?.projectSectionTitle ?? 'Build Real Projects'}
                  </h2>
                  <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
                    {config.uiText?.projectSectionDescription ??
                      'Pick a project below, push it to GitHub, then submit your repo link to track your progress.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
                  {projects.map((proj, i) => {
                    const isSelected = selectedProject === proj.id;
                    return (
                      <motion.button
                        key={proj.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: i * 0.05 }}
                        onClick={() => setSelectedProject(proj.id)}
                        className={`relative text-left rounded-2xl border p-5 transition-all duration-200 cursor-pointer group
                    ${
                      isSelected
                        ? 'border-indigo-500/60 bg-indigo-600/10 shadow-lg shadow-indigo-500/10'
                        : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                    }`}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400 shadow shadow-indigo-400" />
                        )}

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border mb-3 ${proj.difficultyColor}`}
                        >
                          {proj.difficulty}
                        </span>

                        <h3 className="text-sm font-bold text-white mb-2 leading-snug">{proj.title}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">{proj.description}</p>

                        <div className="flex flex-wrap gap-1.5">
                          {proj.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-white/6 border border-white/10 text-[11px] text-zinc-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#1e1b4b]/40 to-slate-900 p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
                      <Github className="w-4.5 h-4.5 text-indigo-400" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">Submit Your Project</h3>
                      <p className="text-xs text-zinc-500">
                        Set visibility and submit your GitHub repository URL below
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                          Selected project
                        </label>
                        <select
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                          className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-white px-4 py-2.5
                               focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30
                               transition-all appearance-none"
                        >
                          {projects.map((p) => (
                            <option key={p.id} value={p.id} className="bg-slate-900">
                              [{p.difficulty}] {p.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Visibility</label>
                        <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
                          <button
                            type="button"
                            onClick={() => requestPrivacyChange('form', false)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                              !isProjectPublic
                                ? 'bg-zinc-700/80 text-zinc-100'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            Private
                          </button>
                          <button
                            type="button"
                            onClick={() => requestPrivacyChange('form', true)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                              isProjectPublic
                                ? 'bg-emerald-500/80 text-white'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            Public
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        GitHub repository URL
                      </label>
                      <div className="relative">
                        <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        <input
                          type="url"
                          placeholder="https://github.com/your-username/your-repo"
                          value={githubUrl}
                          onChange={(e) => {
                            setGithubUrl(e.target.value);
                            setSubmitError('');
                          }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white
                               placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60
                               focus:ring-1 focus:ring-indigo-500/30 transition-all"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-500">
                      {selectedProjectSubmission
                        ? 'Updating this form will edit the existing submission for this project.'
                        : 'This will create your first submission for this project.'}
                    </div>

                    {submitError && (
                      <div className="flex items-center gap-2 text-xs text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {submitError}
                      </div>
                    )}
                    {submitSuccess && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        {submitAction === 'updated'
                          ? 'Submission updated - visibility and link are synced.'
                          : 'Project submitted - great work! Keep building.'}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-gradient-to-r from-indigo-600 to-purple-600
                           hover:from-indigo-500 hover:to-purple-500
                           text-sm font-semibold text-white transition-all
                           shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                    >
                      <Send className="w-4 h-4" />
                      {selectedProjectSubmission ? 'Update Submission' : 'Submit Project'}
                    </button>
                  </form>
                </motion.div>

                {submissions.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Your Submissions</h3>
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-medium">
                        {submissions.length}
                      </span>
                    </div>

                    {submissions.map((sub) => {
                      const proj = projects.find((p) => p.id === sub.projectId);
                      return (
                        <div key={sub.id} className="space-y-2">
                          <div
                            className="flex items-center gap-4 rounded-xl border border-white/8
                                 bg-white/3 hover:bg-white/5 px-4 py-3 transition-all group"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{proj?.title ?? sub.projectId}</p>
                              <a
                                href={sub.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 truncate block transition-colors"
                              >
                                {sub.url}
                              </a>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  sub.isPublic
                                    ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                                    : 'text-zinc-300 bg-zinc-700/30 border-zinc-500/40'
                                }`}
                              >
                                {sub.isPublic ? 'Public' : 'Private'}
                              </span>

                              <span className="text-[11px] text-zinc-600">{sub.date}</span>
                            </div>

                            <button
                              onClick={() => setSubmissions((prev) => prev.filter((s) => s.id !== sub.id))}
                              className="p-1.5 rounded-lg text-zinc-700 hover:text-rose-400 hover:bg-rose-400/10
                                   opacity-0 group-hover:opacity-100 transition-all"
                              aria-label="Remove submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {modules.comments && sub.isPublic && (
                            <ProjectComments
                              initialComments={sub.comments ?? []}
                              currentUserName="You"
                              initialVisibleCount={2}
                              onCommentsChange={(comments) =>
                                setSubmissions((prev) =>
                                  prev.map((s) => (s.id === sub.id ? { ...s, comments } : s)),
                                )
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {submissions.length === 0 && (
                  <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-xs text-zinc-400">
                    No submissions yet. Submit your first project above.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {(!modules.projects || secondarySectionVisibility.projects) && (
        <div ref={careerTriggerRef} className="h-px w-full" />
      )}

      {secondarySectionVisibility.career && modules.careerSupport && careerFeatures.length > 0 && (
        <div
          className="w-full py-16 px-4"
          style={{
            background: 'linear-gradient(180deg, #09090b 0%, #111827 50%, #09090b 100%)',
            borderTop: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-3">
                <Trophy className="w-3.5 h-3.5" />
                {config.uiText?.careerKicker ?? 'Career Acceleration'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {config.uiText?.careerTitle ?? 'Career Launchpad'}
              </h2>
              <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
                {config.uiText?.careerDescription ??
                  'Three focused tools to help you move from learning to hiring outcomes.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 items-stretch">
              {careerFeatures.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className={`rounded-2xl border p-4 sm:p-5 bg-gradient-to-br h-full flex flex-col ${feature.accent}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-black/30 border border-white/15">
                        <FeatureIcon className="w-4.5 h-4.5 text-white" />
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-300/85 shrink-0" />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-4 leading-snug min-h-[3.25rem] sm:min-h-[3.75rem]">
                      {feature.title}
                    </h3>

                    <div className="flex flex-wrap content-start gap-2 mb-4 sm:mb-5 flex-1">
                      {feature.highlights.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 rounded-md bg-black/25 border border-white/10 text-[11px] sm:text-xs text-zinc-100"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCareerFeatureAction(feature.id)}
                      className="w-full mt-auto rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm sm:text-[15px] font-semibold text-white/95 hover:bg-black/40 transition-colors"
                    >
                      {feature.action}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {modules.jobMatches && isJobMatchesExpanded && (
              <motion.div
                ref={jobMatchesRef}
                initial={{ opacity: 0, height: 0, y: 12 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/8">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-white">Recommended Job Matches</h3>
                      <p className="text-[11px] sm:text-xs text-zinc-400">
                        Ranked by {config.breadcrumbLabel.toLowerCase()} roadmap keyword relevance.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsJobMatchesExpanded(false)}
                      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" /> Collapse
                    </button>
                  </div>

                  {jobMatchesLoading && (
                    <div className="px-4 py-8 text-zinc-400 text-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Fetching jobs from your roadmap keywords...
                    </div>
                  )}

                  {!jobMatchesLoading && jobMatchesError && (
                    <div className="px-4 py-6">
                      <p className="text-sm text-rose-300 mb-3">{jobMatchesError}</p>
                      <button
                        type="button"
                        onClick={fetchRoadmapJobMatches}
                        className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/20 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!jobMatchesLoading && !jobMatchesError && matchedJobs.length === 0 && (
                    <div className="px-4 py-6 text-sm text-zinc-400">
                      No relevant jobs found right now. Try again later.
                    </div>
                  )}

                  {!jobMatchesLoading && !jobMatchesError && matchedJobs.length > 0 && (
                    <div className="px-4 py-4 overflow-x-auto pb-5">
                      <div className="flex gap-4 min-w-max pr-2 snap-x snap-mandatory">
                        {matchedJobs.map((job) => (
                          <div
                            key={`${job.id}-${job.url}`}
                            className="w-[280px] sm:w-[320px] shrink-0 snap-start rounded-xl border border-white/10 bg-black/25 p-4 flex flex-col gap-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-2">
                                {job.title}
                              </h4>
                              <div className="relative shrink-0 flex flex-col items-end gap-1">
                                <span className="text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
                                  {job.matchPercentage}%
                                </span>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const willLike = !likedJobIds[job.id];
                                    setLikedJobIds((prev) => ({
                                      ...prev,
                                      [job.id]: willLike,
                                    }));

                                    if (willLike) {
                                      setLikeBurst({ jobId: job.id, nonce: Date.now() });
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
                                    likedJobIds[job.id]
                                      ? 'text-rose-300'
                                      : 'text-zinc-400 hover:text-zinc-200'
                                  }`}
                                  aria-label="Save or like this job"
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 ${
                                      likedJobIds[job.id] ? 'fill-current' : ''
                                    }`}
                                  />
                                  {(job.savedCount ?? getSeededSaveCount(job.id)) +
                                    (likedJobIds[job.id] ? 1 : 0)}
                                </button>

                                <AnimatePresence>
                                  {likeBurst?.jobId === job.id && (
                                    <motion.div
                                      key={likeBurst.nonce}
                                      className="pointer-events-none absolute right-[25px] top-6"
                                      initial={{ opacity: 1 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                    >
                                      <motion.span
                                        className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-300/70"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1.6, opacity: [0, 0.8, 0] }}
                                        transition={{ duration: 0.55, ease: 'easeOut' }}
                                      />

                                      {LIKE_POP_PARTICLES.map((particle, idx) => (
                                        <motion.span
                                          key={`${particle.x}-${particle.y}-${idx}`}
                                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                                          style={{
                                            width: `${particle.size}px`,
                                            height: `${particle.size}px`,
                                            backgroundColor: particle.color,
                                          }}
                                          initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                                          animate={{
                                            x: particle.x,
                                            y: particle.y,
                                            scale: [0.4, 1, 0.6],
                                            opacity: [0, 1, 0],
                                          }}
                                          transition={{
                                            duration: 0.62,
                                            delay: particle.delay,
                                            ease: 'easeOut',
                                          }}
                                        />
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <div className="text-xs text-zinc-300 flex flex-col gap-1.5">
                              <span className="inline-flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                                {job.company_name || 'Unknown company'}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                                {job.location || 'Location not specified'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                                <FolderGit2 className="w-3.5 h-3.5" />
                                {job.type || 'Role'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                                <DollarSign className="w-3.5 h-3.5" />
                                {formatIndianLakhSalary(job.salary)}
                              </span>
                            </div>

                            {job.matchReason && (
                              <p className="text-[11px] text-zinc-400 line-clamp-2">{job.matchReason}</p>
                            )}

                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                            >
                              View Job <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {(!modules.careerSupport || secondarySectionVisibility.career) && (
        <div ref={faqTriggerRef} className="h-px w-full" />
      )}

      {secondarySectionVisibility.faq && modules.faq && faqs.length > 0 && (
        <div
          className="w-full py-16 px-4"
          style={{
            background: 'linear-gradient(180deg, #09090b 0%, #0f172a 60%, #09090b 100%)',
            borderTop: '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">
                {config.uiText?.faqKicker ?? `${config.breadcrumbLabel} Roadmap`}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {config.uiText?.faqTitle ?? 'Frequently Asked Questions'}
              </h2>
              <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                {config.uiText?.faqDescription ??
                  `Common questions about learning ${config.breadcrumbLabel.toLowerCase()} development and becoming job-ready.`}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => {
                const isOpen = openFaqs.includes(faq.id);
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    className="rounded-xl border overflow-hidden"
                    style={{
                      borderColor: isOpen ? 'rgba(139,92,246,0.5)' : 'rgba(63,63,70,0.6)',
                      background: isOpen
                        ? 'linear-gradient(135deg,rgba(30,27,75,0.7),rgba(15,23,42,0.9))'
                        : 'rgba(24,24,27,0.8)',
                      boxShadow: isOpen
                        ? '0 0 0 1px rgba(139,92,246,0.2), 0 4px 20px rgba(0,0,0,0.3)'
                        : 'none',
                      transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <button
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer group"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isOpen ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                        }`}
                      >
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-purple-400' : 'text-zinc-500'
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-zinc-700/50 pt-3">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selected && nodeDetails[selected.id] && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-72 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col max-h-[70vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">{selected.data.label}</h2>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
              {nodeDetails[selected.id].description}
            </p>

            <div>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1 mb-2">
                <BookOpen size={12} /> Resources
              </h3>
              <ul className="flex flex-col gap-2">
                {nodeDetails[selected.id].resources.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      - {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              size="sm"
              variant={selected.data.completed ? 'outline' : 'default'}
              className={
                selected.data.completed
                  ? 'border-green-400 text-green-600 dark:text-green-400'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
              onClick={() => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === selected.id
                      ? { ...n, data: { ...n.data, completed: !n.data.completed } }
                      : n,
                  ),
                );
                setSelected((prev) =>
                  prev ? { ...prev, data: { ...prev.data, completed: !prev.data.completed } } : null,
                );
              }}
            >
              {selected.data.completed ? 'Mark Incomplete' : 'Mark as Complete'}
            </Button>
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-5 left-5 z-30 rounded-xl border border-zinc-700/60 px-4 py-3 flex flex-col gap-2 pointer-events-none transition-all duration-300 ${
          showLegend ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Legend</span>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-yellow-400 border border-yellow-500 shrink-0" />
            <span className="text-[11px] text-zinc-300">Core topic</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm"
              style={{ background: 'rgba(120,53,15,0.6)', border: '1px solid #f59e0b' }}
            />
            <span className="text-[11px] text-zinc-300">Sub-topic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-zinc-700 border border-zinc-400 shrink-0" />
            <span className="text-[11px] text-zinc-300">Tool / Option</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-emerald-800 border border-emerald-400 shrink-0" />
            <span className="text-[11px] text-zinc-300">Completed</span>
          </div>
        </div>
      </div>

      {sectionCollapseEnabled && (
        <div
          className="fixed bottom-5 right-5 z-30 rounded-xl border border-zinc-700/60 px-4 py-3 flex flex-col gap-2 w-64 max-h-[40vh]"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Sections</span>
            <div className="flex items-center gap-1">
              <button
                onClick={expandAllSections}
                disabled={collapsedSections.size === 0}
                className="text-[10px] px-2 py-1 rounded-md border border-zinc-600 text-zinc-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Expand all
              </button>
              <button
                onClick={collapseAllSections}
                disabled={collapsedSections.size === config.mainSectionIds.length}
                className="text-[10px] px-2 py-1 rounded-md border border-zinc-600 text-zinc-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Collapse all
              </button>
            </div>
          </div>

          <div className="overflow-y-auto pr-1 flex flex-col gap-1">
            {sectionControls.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSectionCollapse(section.id)}
                className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-md border border-zinc-700/80 hover:bg-white/10"
              >
                <span className="text-[11px] text-zinc-200 truncate pr-2">{section.label}</span>
                <span className="text-zinc-400 shrink-0">
                  {section.collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Footer />

      {modules.privacyWarning && (
        <PrivacyWarningModal
          open={privacyChangeRequest.open}
          targetVisibility={privacyChangeRequest.targetVisibility}
          onCancel={closePrivacyModal}
          onConfirm={confirmPrivacyChange}
        />
      )}

      <NodeDetailSidebar
        open={sidebar.open}
        sectionId={sidebar.sectionId}
        activeNodeId={sidebar.activeNodeId}
        onClose={() => setSidebar({ open: false, sectionId: null, activeNodeId: null })}
        onMarkComplete={(nodeId) =>
          setNodes((nds) => {
            const updated = nds.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, completed: true } } : n,
            );

            const sectionId = SECTION_NODE_MAP[nodeId];
            if (sectionId && sectionId !== nodeId) {
              const sectionData = ALL_NODE_DETAILS[sectionId];
              if (sectionData) {
                const subIds = sectionData.subNodes.map((sn) => sn.id);
                const allDone = subIds.every(
                  (id) => updated.find((n) => n.id === id)?.data?.completed === true,
                );
                if (allDone) {
                  return updated.map((n) =>
                    n.id === sectionId ? { ...n, data: { ...n.data, completed: true } } : n,
                  );
                }
              }
            }

            return updated;
          })
        }
      />
    </div>
  );
}

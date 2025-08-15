export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  course: string;
  achievement: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Full Stack Developer",
    company: "Google",
    content: "The roadmaps here are incredibly well-structured. I went from knowing basic HTML to landing my dream job at Google in just 8 months. The step-by-step approach and practical projects made all the difference!",
    rating: 5,
    avatar: "SC",
    course: "Full Stack Development",
    achievement: "Landed job at Google"
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Data Scientist",
    company: "Microsoft",
    content: "I was struggling with machine learning concepts until I found this platform. The Python Data Science roadmap broke down complex topics into digestible chunks. Now I'm leading ML projects at Microsoft!",
    rating: 5,
    avatar: "MJ",
    course: "Python Data Science",
    achievement: "200% salary increase"
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "DevOps Engineer",
    company: "Amazon",
    content: "The DevOps roadmap here is gold! From basic Linux to Kubernetes orchestration, everything was covered with hands-on projects. I went from support engineer to DevOps lead in 6 months.",
    rating: 5,
    avatar: "PS",
    course: "DevOps Engineering",
    achievement: "Promoted to Team Lead"
  },
  {
    id: 4,
    name: "Alex Rodriguez",
    role: "Mobile Developer",
    company: "Netflix",
    content: "React Native roadmap helped me transition from web to mobile development seamlessly. The practical approach with real-world projects prepared me perfectly for my role at Netflix.",
    rating: 5,
    avatar: "AR",
    course: "React Native",
    achievement: "Career transition success"
  },
  {
    id: 5,
    name: "Emily Watson",
    role: "UI/UX Designer",
    company: "Adobe",
    content: "The design roadmaps here are phenomenal! From Figma basics to advanced prototyping, everything was covered. The design thinking approach helped me land my dream job at Adobe.",
    rating: 5,
    avatar: "EW",
    course: "UI/UX Design",
    achievement: "Joined Adobe Design Team"
  },
  {
    id: 6,
    name: "David Kim",
    role: "Blockchain Developer",
    company: "Coinbase",
    content: "Blockchain seemed intimidating until I followed the roadmap here. The progression from basics to smart contracts was perfect. Now I'm building the future of finance at Coinbase!",
    rating: 5,
    avatar: "DK",
    course: "Blockchain Development",
    achievement: "Built 5+ DApps"
  }
];

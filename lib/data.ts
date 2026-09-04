export const personal = {
  name: "Sushma Acharya",
  role: "Computer Engineering Undergraduate",
  location: "Kathmandu, Nepal",
  summary:
    "I'm a Computer Engineering undergraduate at Kathmandu University with hands-on experience across full-stack web development, and interface design. My work spans web applications, natural language processing, real-time 3D visualization, and UI/UX design, reflecting both technical range and a consistent drive to turn ideas into working products. I'm seeking internship opportunities where I can bring this range and keep learning quickly.",
  email: "sushmaacharya984@gmail.com",
  phone: "+977 9840257870",
  linkedin: "https://www.linkedin.com/in/sushma-acharya-0a30b42b7/",
  github: "https://github.com/suslabok",
  resumeUrl: "https://drive.google.com/file/d/1i1d2Pc3YyVNJJdT2pRczKi0lh_56maN2/view?usp=sharing",
} as const;

export const languages = ["English", "Nepali", "Hindi"] as const;
export const roles = ["Developer", "Software Designer", "Happy Coding!","Creative Technologist"] as const;

export const skills: string[] = [
  "JavaScript",
  "TypeScript",
  "Python",
  "C++",
  "C#",
  "React.js",
  "Next.js",
  "Tailwind CSS",
  "Bootstrap",
  "HTML5",
  "CSS3",
  "Responsive Design",
  "Node.js",
  "Express.js",
  "Django",
  "FastAPI",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "PyTorch",
  "NLP / spaCy",
  "Git",
  "GitHub",
  "Docker",
  "VS Code",
  "Figma",
  "Unity Engine",
  "Three.js",
];

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  featured: boolean;

  image?: string;
}

export const projects: Project[] = [
  {
    slug: "medical-vision-assistant",
    title: "Medical Vision Assistant",
    tagline: "AI-Powered Healthcare Platform",
    description:
      "Built an end-to-end full-stack AI platform that analyzes chest X-ray images, featuring disease classification, explainable AI (Grad-CAM), automated report generation, and a patient-history research dashboard.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "FastAPI", "Python", "PostgreSQL"],
    repoUrl: "https://github.com/suslabok/Medical-Vision-Assistant", 
    liveUrl: null,
    featured: true,
    image: "/projects/medical-vision-assistant.png",
  },
  {
    slug: "multimodal-ai-assistant",
    title: "Multimodal AI Assistant",
    tagline: "AI Chatbot with Vision",
    description:
      "An AI chatbot with image upload support, Markdown rendering, authentication, and a responsive interface.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "OpenAI API"],
    repoUrl: "https://github.com/suslabok/Multimodal-AI-chatbot", 
    liveUrl: null,
    featured: true,
    image: "/projects/multimodal-ai-assistant.png",
  },
  {
    slug: "saraldoc",
    title: "SaralDoc",
    tagline: "Nepali Legal Document Analyzer",
    description:
      "A full-stack tool that extracts clauses, obligations, and named entities dates, amounts, parties from Nepali and English legal documents. Supports PDF/DOCX/TXT ingestion, a document complexity score, and automatic summarization using NLP techniques.",
    tech: ["React", "FastAPI", "Python", "spaCy / NLP", "PostgreSQL"],
    repoUrl: "https://github.com/suslabok/SaralDoc",
    liveUrl: null,
    featured: true,
    image: "/projects/saraldoc.png",
  },
  {
    slug: "water-cycle-simulator",
    title: "Water Cycle Simulator",
    tagline: "Interactive 3D Educational Visualization",
    description:
      "A 3D interactive educational simulator visualizing evaporation, condensation, precipitation, and collection, with custom particle systems and multi-camera controls.",
    tech: ["React", "Three.js"],
    repoUrl: "https://github.com/suslabok/WaterCycleSimulator",
    liveUrl: null,
    featured: true,
    image: "/projects/water-cycle-simulator.png",
  },
  {
    slug: "kaamlink",
    title: "KaamLink",
    tagline: "Job Portal Web App",
    description:
      "A full-stack job portal with separate job-seeker and recruiter workflows for browsing, posting, saving, and applying to jobs.",
    tech: ["JavaScript", "Node.js", "CSS"],
    repoUrl: "https://github.com/suslabok/Job-Portal-Kaam-Link",
    liveUrl: null,
    featured: false,
    image: "/projects/kaamlink.png",
  },
];

export interface EducationEntry {
  degree: string;
  institution: string;
  period: string;
  gpa: string | null;
}

export const education: EducationEntry[] = [
  {
    degree: "Bachelor of Computer Engineering",
    institution: "Kathmandu University",
    period: "2022 — 2027",
    gpa: null,
  },
  {
    degree: "Higher Secondary Education",
    institution: "St. Xavier's College",
    period: "2020 — 2022",
    gpa: "3.68",
  },
];
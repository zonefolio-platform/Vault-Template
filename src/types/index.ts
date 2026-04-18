export interface SocialLink {
  platform?: string;
  url?: string;
}

export interface WorkExperience {
  position?: string;
  company?: string;
  duration?: string;
  description?: string;
}

export interface Education {
  degree?: string;
  university?: string;
  from?: string;
  to?: string;
  GPA?: string;
}

export interface Project {
  name?: string;
  description?: string;
  image?: string;
  technologies?: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  whatsapp?: string;
}

export interface Meta {
  plan?: string;
  showBranding?: boolean;
}

export interface PortfolioData {
  hero?: {
    name?: string;
    title?: string;
    image?: string;
    socialLinks?: SocialLink[];
  };
  about?: {
    bio?: string;
    image?: string;
    skills?: string[];
    experience?: WorkExperience[];
    education?: Education[];
  };
  projects?: {
    projects?: Project[];
  };
  contact?: ContactInfo;
  meta?: Meta;
}

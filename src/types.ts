export interface ContainerItem {
  id: string;
  title: string;
  category: string;
  description: string;
  specs: string[];
  image: string;
  whatsappMsg: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  imageBefore?: string;
  imageAfter: string;
  description: string;
  specs?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

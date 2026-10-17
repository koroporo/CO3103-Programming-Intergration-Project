export const featuredCourse = {
  id: 'academic-mastery',
  title: 'IELTS Academic Mastery: Band 7.5 Intensive Program',
  instructor: 'Sarah Thompson',
  instructorThumbnail: 'icons.svg',
  thumbnail: '/course-assets/academic-mastery.png',
  description:
    'Build the skills and confidence to target Band 7.5 with focused IELTS Academic practice.',
  duration: '6 weeks',
  tags: ['IELTS', 'Academic', 'Intensive'],
  rate: 4.8,
  enrollmentCount: 1200,
  prerequisites: "Intermediate English proficiency",
  reviews: [
    {
      reviewer: 'John Doe',
      rating: 5,
      comment: 'This course helped me achieve my target score!',
      time: '2 weeks ago',
    },
    {
      reviewer: 'Jane Smith',
      rating: 4,
      comment: 'Great content, but I wish there were more practice tests.',
      time: '1 month ago',
    },
    {
      reviewer: 'Bob Johnson',
      rating: 5,
      comment: 'Highly recommended for anyone looking to improve their IELTS score.',
      time: '3 weeks ago',
    }
  ],
  
  materials: [
    {
      title: 'Official IELTS Website',
      url: 'https://www.ielts.org/',
      description: 'Visit the official IELTS website for more information and resources.',
    },
    {
      title: 'IELTS Practice Tests',
      url: 'https://www.ielts.org/about-the-test/sample-test-questions',
      description: 'Access sample test questions and practice materials for IELTS.',
    },
  ] 
    
};

export const courses = [
  {
    id: 'general-training',
    title: 'IELTS General Training: Band 7 Fast Track',
    instructor: 'Sarah Thompson',
    instructorThumbnail: 'icons.svg',
    thumbnail: '/course-assets/general-training.png',
    description:
      'Prepare for IELTS General Training with a focused path toward your Band 7 goal.',
    duration: '4 weeks',
    tags: ['IELTS', 'General Training', 'Fast Track'],
    rate: 4.5,
    enrollmentCount: 800,
    prerequisites: "Basic English proficiency",
    reviews: [
      {
        reviewer: 'Alice Brown',
        rating: 5,
        comment: 'This course was exactly what I needed to improve my score!',
        time: '1 month ago',
      },
      {
        reviewer: 'David Wilson',
        rating: 4,
        comment: 'Good content, but I would have liked more practice exercises.',
        time: '2 weeks ago',
      },
    ],
 
    materials: [
      {
        title: 'Official IELTS Website',
        url: 'https://www.ielts.org/',
        description: 'Visit the official IELTS website for more information and resources.',
      },
      {
        title: 'IELTS Practice Tests',
        url: 'https://www.ielts.org/about-the-test/sample-test-questions',
        description: 'Access sample test questions and practice materials for IELTS.',
      },
    ] 
  },
  {
    id: 'masterclass',
    title: 'Masterclass IELTS 8.0 by Aarya Singh (2026)',
    instructor: 'Aarya Singh',
    instructorThumbnail: 'icons.svg',
    thumbnail: '/course-assets/masterclass.png',
    description:
      'Explore advanced IELTS strategies and practice with Aarya Singh’s Band 8 masterclass.',
    duration: '8 weeks',
    tags: ['IELTS', 'Masterclass', 'Advanced'],
    rate: 4.9,
    enrollmentCount: 1500,
    prerequisites: "Advanced English proficiency",
    reviews: [
      {
        reviewer: 'Emily Davis',
        rating: 5,
        comment: 'Aarya’s masterclass is a game-changer for IELTS preparation!',
        time: '3 weeks ago',
      },
      {
        reviewer: 'Michael Lee',
        rating: 4,
        comment: 'Excellent content, but I wish there were more interactive sessions.',
        time: '1 month ago',
      },
    ],
    materials: [
      {
        title: 'Official IELTS Website',
        url: 'https://www.ielts.org/',
        description: 'Visit the official IELTS website for more information and resources.',
      },
      {
        title: 'IELTS Practice Tests',
        url: 'https://www.ielts.org/about-the-test/sample-test-questions',
        description: 'Access sample test questions and practice materials for IELTS.',
      },
    ]   
    },
  {
    id: 'vocabulary',
    title: 'Lexical Resources: IELTS Vocabulary Topics',
    instructor: 'Donna Stroupe',
    instructorThumbnail: 'icons.svg',
    thumbnail: '/course-assets/vocabulary.png',
    description:
      'Strengthen your IELTS vocabulary with lexical resources organized around useful topics.',
  },
  {
    id: 'listening',
    title: 'Daily Listening with me',
    instructor: 'Olivia Wilson',
    instructorThumbnail: 'icons.svg',
    thumbnail: '/course-assets/listening.png',
    description:
      'Practice your listening skills with regular IELTS-focused exercises.',
  },
  {
    id: 'speaking',
    title: 'The efficient way of speaking English confidently',
    instructor: 'Adora Montminy',
    instructorThumbnail: 'icons.svg',
    thumbnail: '/course-assets/speaking.png',
    description:
      'Build confidence and fluency for English speaking and IELTS practice.',
  },
  {
    id: 'reading',
    title: 'Reading Course: Books to Change Your Mindset',
    instructor: 'Samira Hadid',
    instructorThumbnail: 'icons.svg',
    thumbnail: '/course-assets/reading.png',
    description:
      'Develop your reading skills through engaging texts and IELTS reading practice.',
  },
];

export const allCourses = [featuredCourse, ...courses];

export function getCourseById(courseId) {
  return allCourses.find((course) => course.id === courseId);
}

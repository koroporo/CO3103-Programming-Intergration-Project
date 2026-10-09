export const featuredCourse = {
  id: 'academic-mastery',
  title: 'IELTS Academic Mastery: Band 7.5 Intensive Program',
  instructor: 'Sarah Thompson',
  thumbnail: '/course-assets/academic-mastery.png',
  description:
    'Build the skills and confidence to target Band 7.5 with focused IELTS Academic practice.',
};

export const courses = [
  {
    id: 'general-training',
    title: 'IELTS General Training: Band 7 Fast Track',
    instructor: 'Sarah Thompson',
    thumbnail: '/course-assets/general-training.png',
    description:
      'Prepare for IELTS General Training with a focused path toward your Band 7 goal.',
  },
  {
    id: 'masterclass',
    title: 'Masterclass IELTS 8.0 by Aarya Singh (2026)',
    instructor: 'Aarya Singh',
    thumbnail: '/course-assets/masterclass.png',
    description:
      'Explore advanced IELTS strategies and practice with Aarya Singh’s Band 8 masterclass.',
  },
  {
    id: 'vocabulary',
    title: 'Lexical Resources: IELTS Vocabulary Topics',
    instructor: 'Donna Stroupe',
    thumbnail: '/course-assets/vocabulary.png',
    description:
      'Strengthen your IELTS vocabulary with lexical resources organized around useful topics.',
  },
  {
    id: 'listening',
    title: 'Daily Listening with me',
    instructor: 'Olivia Wilson',
    thumbnail: '/course-assets/listening.png',
    description:
      'Practice your listening skills with regular IELTS-focused exercises.',
  },
  {
    id: 'speaking',
    title: 'The efficient way of speaking English confidently',
    instructor: 'Adora Montminy',
    thumbnail: '/course-assets/speaking.png',
    description:
      'Build confidence and fluency for English speaking and IELTS practice.',
  },
  {
    id: 'reading',
    title: 'Reading Course: Books to Change Your Mindset',
    instructor: 'Samira Hadid',
    thumbnail: '/course-assets/reading.png',
    description:
      'Develop your reading skills through engaging texts and IELTS reading practice.',
  },
];

export const allCourses = [featuredCourse, ...courses];

export function getCourseById(courseId) {
  return allCourses.find((course) => course.id === courseId);
}

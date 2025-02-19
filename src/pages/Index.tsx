
import { Navigation } from '@/components/Navigation';
import { CourseCard } from '@/components/CourseCard';

const FEATURED_COURSES = [
  {
    title: "Master Web Development: Complete 2024 Guide",
    description: "Learn modern web development with practical projects and industry best practices",
    instructor: "Sarah Johnson",
    duration: "32 hours",
    students: 15420,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    category: "Development"
  },
  {
    title: "Data Science Fundamentals: From Zero to Hero",
    description: "Master the essentials of data science, statistics, and machine learning",
    instructor: "Michael Chen",
    duration: "28 hours",
    students: 12350,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    category: "Data Science"
  },
  {
    title: "Digital Marketing Mastery 2024",
    description: "Learn cutting-edge digital marketing strategies for business growth",
    instructor: "Emma Williams",
    duration: "24 hours",
    students: 9840,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    category: "Marketing"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <span className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary animate-fade-down">
            Welcome to LearnWave
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-down" style={{ animationDelay: "100ms" }}>
            Unlock Your Potential with
            <span className="text-primary"> Expert-Led Courses</span>
          </h1>
          <p className="text-neutral-600 text-lg mb-8 max-w-2xl mx-auto animate-fade-down" style={{ animationDelay: "200ms" }}>
            Discover world-class courses taught by industry experts. Start your learning journey today.
          </p>
          <button className="button-primary text-lg px-8 py-3 animate-fade-down" style={{ animationDelay: "300ms" }}>
            Explore Courses
          </button>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_COURSES.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

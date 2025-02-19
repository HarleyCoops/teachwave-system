
import { Clock, Users, Star } from 'lucide-react';

interface CourseCardProps {
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  image: string;
  category: string;
  onClick?: () => void;
}

export const CourseCard = ({
  title,
  description,
  instructor,
  duration,
  students,
  rating,
  image,
  category,
  onClick
}: CourseCardProps) => {
  return (
    <div className="card card-hover animate-scale-up cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full glass">
          {category}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold mb-2 text-balance line-clamp-2">
        {title}
      </h3>
      
      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
        {description}
      </p>
      
      <div className="flex items-center text-sm text-neutral-600 mb-3">
        <Clock size={16} className="mr-1" />
        <span className="mr-4">{duration}</span>
        <Users size={16} className="mr-1" />
        <span>{students.toLocaleString()} students</span>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center">
          <Star size={16} className="text-yellow-400 mr-1" />
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>
        <span className="text-sm font-medium text-neutral-600">
          By {instructor}
        </span>
      </div>
    </div>
  );
};

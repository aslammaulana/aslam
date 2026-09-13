import React from 'react';
import { Award, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { Course } from '../../types.ts';

interface CoursesSectionProps {
  courses: Course[];
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ courses }) => {
  if (!courses || courses.length === 0) return null;

  return (
    <section id="pelatihan" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-16">
        
        {/* Section Heading */}
        <div className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pelatihan & Kursus</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sertifikasi, workshop, dan program pengembangan diri yang telah diselesaikan.
          </p>
        </div>

        {/* Courses List */}
        <div className="flex-1 space-y-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white hover:bg-slate-50/50 border border-slate-200 rounded-2xl p-5 sm:p-6 transition-all shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-start sm:items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span>{course.course_name}</span>
                </h3>

                <div className="flex items-center gap-2 flex-wrap">
                  {course.year && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {course.year}
                    </span>
                  )}
                  {course.location && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {course.location}
                    </span>
                  )}
                </div>
              </div>

              {course.organizer && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Penyelenggara: {course.organizer}</span>
                </div>
              )}

              {course.description && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {course.description}
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

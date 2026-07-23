import Link from 'next/link';

interface IdeaCardProps {
  title: string;
  description: string;
  status: 'High Potential' | 'Funded' | 'Promising' | 'Analyzed' | 'Pending';
  image: string;
  score?: number;
  date?: string;
  showActions?: boolean;
}

export default function IdeaCard({ 
  title, 
  description, 
  status, 
  image, 
  score, 
  date, 
  showActions = true 
}: IdeaCardProps) {
  const statusColors = {
    'High Potential': 'bg-green-100 text-green-800',
    'Funded': 'bg-blue-100 text-blue-800',
    'Promising': 'bg-yellow-100 text-yellow-800',
    'Analyzed': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
      <div 
        className="h-48 w-full bg-cover bg-center" 
        style={{ backgroundImage: `url(${image})` }}
      ></div>
      
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          
          {score && (
            <div className="flex-shrink-0 ml-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                {score}%
              </div>
            </div>
          )}
        </div>
        
        {date && (
          <p className="text-sm text-gray-500 mt-1">{date}</p>
        )}
        
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[status]}`}>
            {status}
          </span>
          
          {showActions && (
            <Link 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500" 
              href="/analysis"
            >
              View Analysis →
            </Link>
          )}
        </div>
        
        {showActions && (
          <div className="mt-4 flex gap-2">
            <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M213.66,133.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L120,188.69V40a8,8,0,0,1,16,0V188.69l66.34-66.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
              Download
            </button>
            
            <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M232,80a8,8,0,0,1-8,8h-8V93.39a32.06,32.06,0,0,1-3.66,15.1,32.06,32.06,0,0,1-15.1,3.66H52.76a32.06,32.06,0,0,1-15.1-3.66A32.06,32.06,0,0,1,34,93.39V48a8,8,0,0,1,16,0V93.39a16,16,0,0,0,2.74,9.25,16,16,0,0,0,9.25,2.74H206.61a16,16,0,0,0,9.25-2.74,16,16,0,0,0,2.74-9.25V56h-8a8,8,0,0,1,0-16h8a8,8,0,0,1,8,8ZM184,144a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8v64a8,8,0,0,0,8,8H176a8,8,0,0,0,8-8Zm-8,64H48V152H176Zm56-96h8a8,8,0,0,0,0-16H184a8,8,0,0,0-8,8v8h8a8,8,0,0,0,8-8Z"></path>
              </svg>
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
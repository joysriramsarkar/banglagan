'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toBengaliNumerals } from '@/lib/utils'; // Import the utility function

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean; // Optional loading state
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or no pages
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1 || isLoading}
        aria-label="পূর্ববর্তী পৃষ্ঠা"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>পূর্ববর্তী</span>
      </Button>
      <span className="text-sm text-muted-foreground">
        পৃষ্ঠা {toBengaliNumerals(currentPage)} এর {toBengaliNumerals(totalPages)}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages || isLoading}
        aria-label="পরবর্তী পৃষ্ঠা"
      >
        <span>পরবর্তী</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}


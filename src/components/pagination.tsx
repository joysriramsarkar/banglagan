'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toBengaliNumerals } from '@/lib/utils'; // Import the utility function
import * as React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean; // Optional loading state
}

const DOTS = '...';

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

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

  const paginationRange = React.useMemo(() => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5; // siblingCount + firstPage + lastPage + currentPage + 2*DOTS

    /*
      Case 1:
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPages]
    */
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    /*
    	Calculate left and right sibling index and make sure they are within range 1 and totalPages
    */
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPages
    );

    /*
      We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPages. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPages - 2
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    /*
    	Case 2: No left dots to show, but rights dots to be shown
    */
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPages];
    }

    /*
    	Case 3: No right dots to show, but left dots to be shown
    */
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(
        totalPages - rightItemCount + 1,
        totalPages
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    /*
    	Case 4: Both left and right dots to be shown
    */
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Default fallback, should ideally not be reached if logic above is correct
    return range(1, totalPages); 

  }, [totalPages, currentPage]);


  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or no pages
  }

  return (
    <div className="flex items-center justify-center space-x-1 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1 || isLoading}
        aria-label="পূর্ববর্তী পৃষ্ঠা"
        className="px-2.5"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">পূর্ববর্তী</span>
      </Button>
      
      {paginationRange.map((pageNumber, index) => {
        const key = typeof pageNumber === 'number' ? `page-${pageNumber}` : `dots-${index}`;
        if (pageNumber === DOTS) {
          return <span key={key} className="px-2 py-1 text-sm text-muted-foreground">...</span>;
        }

        return (
          <Button
            key={key}
            variant={currentPage === pageNumber ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNumber as number)}
            disabled={isLoading}
            className="px-3"
            aria-label={`পৃষ্ঠা ${toBengaliNumerals(pageNumber as number)}`}
          >
            {toBengaliNumerals(pageNumber as number)}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages || isLoading}
        aria-label="পরবর্তী পৃষ্ঠা"
        className="px-2.5"
      >
        <span className="hidden sm:inline mr-1">পরবর্তী</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

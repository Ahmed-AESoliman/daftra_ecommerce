import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AppPagination({ pagination, setFilters, filters, className }) {
    const [pageNumbers, setPageNumbers] = useState([]);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const getPageNumbers = () => {
        // Handle both naming conventions
        const currentPage = pagination.currentPage || pagination.current_page || 1;
        const lastPage = pagination.lastPage || pagination.last_page || 1;

        if (lastPage <= 1) {
            return [];
        }

        // For small screens, show fewer pages
        const maxPages = isSmallScreen ? 3 : 7;

        if (lastPage <= maxPages) {
            return Array.from({ length: lastPage }, (_, i) => i + 1);
        }

        if (isSmallScreen) {
            if (currentPage === 1) {
                return [1, 2, '...', lastPage];
            } else if (currentPage === lastPage) {
                return [1, '...', lastPage - 1, lastPage];
            } else {
                return [1, '...', currentPage, '...', lastPage];
            }
        }

        // For larger screens, show more pages
        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5, '...', lastPage];
        } else if (currentPage >= lastPage - 2) {
            return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
        } else {
            return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
        }
    };
    useEffect(() => {
        setPageNumbers(getPageNumbers());
    }, [pagination, isSmallScreen]);
    const currentPage = pagination.currentPage || pagination.current_page || 1;
    const lastPage = pagination.lastPage || pagination.last_page || 1;
    const hasMorePages = pagination.hasMorePages || pagination.has_more_pages;

    return (
        <div className={`flex items-center justify-center space-x-2 ${className}`}>
            {currentPage > 1 && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setFilters({
                            ...filters,
                            page: currentPage - 1,
                        })
                    }
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
            )}

            {/* Show page numbers only on larger screens */}
            {!isSmallScreen &&
                pageNumbers.length > 0 &&
                pageNumbers.map((page, index) => {
                    const uniqueKey = page === '...' ? `ellipsis-${index}-${Date.now()}` : `page-${page}-${index}`;

                    return page === '...' ? (
                        <span key={uniqueKey} className="px-2 py-1 text-sm text-gray-500">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={uniqueKey}
                            variant={Number(page) === Number(currentPage) ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                                setFilters({
                                    ...filters,
                                    page: Number(page),
                                })
                            }
                        >
                            {page}
                        </Button>
                    );
                })}

            {/* Show current page info on small screens */}
            {isSmallScreen && lastPage > 1 && (
                <span className="px-3 py-2 text-sm text-gray-600">
                    {currentPage} of {lastPage}
                </span>
            )}

            {hasMorePages && currentPage < lastPage && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setFilters({
                            ...filters,
                            page: currentPage + 1,
                        })
                    }
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

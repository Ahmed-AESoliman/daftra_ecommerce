import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import RangeSlider from 'react-range-slider-input';

interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
}

interface ProductFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    priceRange: number[];
    onPriceRangeChange: (range: number[]) => void;
    categories: Category[];
    selectedCategory: Category | null;
    onCategoryChange: (category: Category | null) => void;
}

const ProductFilterSheet = ({
    isOpen,
    onClose,
    priceRange,
    onPriceRangeChange,
    categories,
    selectedCategory,
    onCategoryChange,
}: ProductFilterSheetProps) => {
    const [localPriceRange, setLocalPriceRange] = useState(priceRange);
    const [isPriceExpanded, setIsPriceExpanded] = useState(true);
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(selectedCategory?.id || null);

    useEffect(() => {
        setLocalPriceRange(priceRange);
    }, [priceRange]);

    useEffect(() => {
        setSelectedCategoryId(selectedCategory?.id || null);
    }, [selectedCategory]);

    const handleApplyFilters = () => {
        onPriceRangeChange(localPriceRange);
        const category = categories.find((cat) => cat.id === selectedCategoryId);
        onCategoryChange(category || null);
        onClose();
    };

    const handleClearFilters = () => {
        setLocalPriceRange([0, 500]);
        setSelectedCategoryId(null);
        onPriceRangeChange([0, 500]);
        onCategoryChange(null);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 pt-2">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>

                <div className="flex h-full flex-col">
                    <div className="flex-1 space-y-0">
                        {/* Price Section */}
                        <div className="border-b border-gray-100">
                            <button
                                onClick={() => setIsPriceExpanded(!isPriceExpanded)}
                                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                            >
                                <h3 className="font-medium text-gray-900">Price</h3>
                                {isPriceExpanded ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </button>
                            {isPriceExpanded && (
                                <div className="px-4 pb-4">
                                    <div className="space-y-4">
                                        {/* Range Slider */}
                                        <div className="relative px-2 py-6">
                                            <RangeSlider
                                                min={0}
                                                max={500}
                                                step={10}
                                                value={[localPriceRange[0], localPriceRange[1]]}
                                                onInput={(value: [number, number]) => setLocalPriceRange(value)}
                                                className="range-slider-custom"
                                            />
                                            <div className="mt-3 flex justify-between text-sm text-gray-600">
                                                <span>${localPriceRange[0]}</span>
                                                <span>${localPriceRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Category Section */}
                        <div className="border-b border-gray-100">
                            <button
                                onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                            >
                                <h3 className="font-medium text-gray-900">Category</h3>
                                {isCategoryExpanded ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </button>
                            {isCategoryExpanded && (
                                <div className="px-4 pb-4">
                                    <div className="space-y-3">
                                        <label className="flex cursor-pointer items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategoryId === null}
                                                onChange={() => setSelectedCategoryId(null)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-blue-600">All</span>
                                        </label>
                                        {categories.map((category) => (
                                            <label key={category.id} className="flex cursor-pointer items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategoryId === category.id}
                                                    onChange={() => setSelectedCategoryId(selectedCategoryId === category.id ? null : category.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                                                />
                                                <span className="text-sm text-gray-700">{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Apply and Clear Buttons */}
                    <div className="space-y-3 border-t bg-white p-4">
                        <button
                            onClick={handleApplyFilters}
                            className="w-full rounded-lg bg-black py-3 font-medium text-white transition-colors hover:bg-gray-800"
                        >
                            Apply Filter
                        </button>
                        <button onClick={handleClearFilters} className="w-full py-2 text-sm text-gray-600 transition-colors hover:text-gray-900">
                            Clear all filters
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default ProductFilterSheet;

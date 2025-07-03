import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

interface CustomerInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (customerInfo: CustomerInfo, shippingInfo?: CustomerInfo) => void;
    isLoading?: boolean;
}

const CustomerInfoModal = ({ isOpen, onClose, onSubmit, isLoading = false }: CustomerInfoModalProps) => {
    const [billingInfo, setBillingInfo] = useState<CustomerInfo>({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA',
    });

    const [shippingInfo, setShippingInfo] = useState<CustomerInfo>({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA',
    });

    const [sameAsBilling, setSameAsBilling] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate billing info
        if (!billingInfo.name.trim()) newErrors.name = 'Name is required';
        if (!billingInfo.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!billingInfo.phone.trim()) newErrors.phone = 'Phone is required';
        if (!billingInfo.address.trim()) newErrors.address = 'Address is required';
        if (!billingInfo.city.trim()) newErrors.city = 'City is required';
        if (!billingInfo.state.trim()) newErrors.state = 'State is required';
        if (!billingInfo.zip.trim()) newErrors.zip = 'ZIP code is required';
        if (!billingInfo.country.trim()) newErrors.country = 'Country is required';

        // Validate shipping info if different
        if (!sameAsBilling) {
            if (!shippingInfo.name.trim()) newErrors.shippingName = 'Shipping name is required';
            if (!shippingInfo.address.trim()) newErrors.shippingAddress = 'Shipping address is required';
            if (!shippingInfo.city.trim()) newErrors.shippingCity = 'Shipping city is required';
            if (!shippingInfo.state.trim()) newErrors.shippingState = 'Shipping state is required';
            if (!shippingInfo.zip.trim()) newErrors.shippingZip = 'Shipping ZIP code is required';
            if (!shippingInfo.country.trim()) newErrors.shippingCountry = 'Shipping country is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const shipping = sameAsBilling ? billingInfo : shippingInfo;
        onSubmit(billingInfo, shipping);
    };

    const handleBillingChange = (field: keyof CustomerInfo, value: string) => {
        setBillingInfo((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleShippingChange = (field: keyof CustomerInfo, value: string) => {
        setShippingInfo((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        const shippingField = `shipping${field.charAt(0).toUpperCase() + field.slice(1)}`;
        if (errors[shippingField]) {
            setErrors((prev) => ({ ...prev, [shippingField]: '' }));
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>Customer Information</SheetTitle>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6 px-4 py-2">
                    {/* Billing Information */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Billing Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
                                <input
                                    type="text"
                                    value={billingInfo.name}
                                    onChange={(e) => handleBillingChange('name', e.target.value)}
                                    className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Email Address *</label>
                                <input
                                    type="email"
                                    value={billingInfo.email}
                                    onChange={(e) => handleBillingChange('email', e.target.value)}
                                    className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={billingInfo.phone}
                                    onChange={(e) => handleBillingChange('phone', e.target.value)}
                                    className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="+1 (555) 123-4567"
                                />
                                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Address *</label>
                                <input
                                    type="text"
                                    value={billingInfo.address}
                                    onChange={(e) => handleBillingChange('address', e.target.value)}
                                    className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                        errors.address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="123 Main Street"
                                />
                                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
                                    <input
                                        type="text"
                                        value={billingInfo.city}
                                        onChange={(e) => handleBillingChange('city', e.target.value)}
                                        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                            errors.city ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="New York"
                                    />
                                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
                                    <input
                                        type="text"
                                        value={billingInfo.state}
                                        onChange={(e) => handleBillingChange('state', e.target.value)}
                                        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                            errors.state ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="NY"
                                    />
                                    {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">ZIP Code *</label>
                                    <input
                                        type="text"
                                        value={billingInfo.zip}
                                        onChange={(e) => handleBillingChange('zip', e.target.value)}
                                        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                            errors.zip ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="10001"
                                    />
                                    {errors.zip && <p className="mt-1 text-xs text-red-500">{errors.zip}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Country *</label>
                                    <select
                                        value={billingInfo.country}
                                        onChange={(e) => handleBillingChange('country', e.target.value)}
                                        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                            errors.country ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="USA">United States</option>
                                        <option value="Canada">Canada</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="Australia">Australia</option>
                                    </select>
                                    {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div>
                        <div className="mb-4 flex items-center">
                            <input
                                type="checkbox"
                                id="sameAsBilling"
                                checked={sameAsBilling}
                                onChange={(e) => setSameAsBilling(e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="sameAsBilling" className="text-sm font-medium text-gray-700">
                                Shipping address is the same as billing address
                            </label>
                        </div>

                        {!sameAsBilling && (
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">Shipping Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
                                        <input
                                            type="text"
                                            value={shippingInfo.name}
                                            onChange={(e) => handleShippingChange('name', e.target.value)}
                                            className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                                errors.shippingName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="John Doe"
                                        />
                                        {errors.shippingName && <p className="mt-1 text-xs text-red-500">{errors.shippingName}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Address *</label>
                                        <input
                                            type="text"
                                            value={shippingInfo.address}
                                            onChange={(e) => handleShippingChange('address', e.target.value)}
                                            className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                                errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="123 Main Street"
                                        />
                                        {errors.shippingAddress && <p className="mt-1 text-xs text-red-500">{errors.shippingAddress}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.city}
                                                onChange={(e) => handleShippingChange('city', e.target.value)}
                                                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                                    errors.shippingCity ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="New York"
                                            />
                                            {errors.shippingCity && <p className="mt-1 text-xs text-red-500">{errors.shippingCity}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.state}
                                                onChange={(e) => handleShippingChange('state', e.target.value)}
                                                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                                    errors.shippingState ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="NY"
                                            />
                                            {errors.shippingState && <p className="mt-1 text-xs text-red-500">{errors.shippingState}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">ZIP Code *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.zip}
                                                onChange={(e) => handleShippingChange('zip', e.target.value)}
                                                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                                    errors.shippingZip ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="10001"
                                            />
                                            {errors.shippingZip && <p className="mt-1 text-xs text-red-500">{errors.shippingZip}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Country *</label>
                                            <select
                                                value={shippingInfo.country}
                                                onChange={(e) => handleShippingChange('country', e.target.value)}
                                                className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none ${
                                                    errors.shippingCountry ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="USA">United States</option>
                                                <option value="Canada">Canada</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="Australia">Australia</option>
                                            </select>
                                            {errors.shippingCountry && <p className="mt-1 text-xs text-red-500">{errors.shippingCountry}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex space-x-3 border-t pt-6">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-black hover:bg-gray-800" disabled={isLoading}>
                            {isLoading ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default CustomerInfoModal;
export type { CustomerInfo };

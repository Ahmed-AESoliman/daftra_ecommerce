import AppLabel from '@/components/app-label';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '@/components/ui/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { productService, handleProductApiError, formatProductForForm } from '@/services/product';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

const CreateOrUpdateProduct = ({ type }) => {
    const params = useParams();
    const slug = type === 'edit' ? params.slug : null;

    const initData = {
        name: '',
        description: '',
        short_description: '',
        sku: '',
        price: '',
        sale_price: '',
        stock_quantity: '',
        in_stock: true,
        is_active: true,
        category_id: '',
        image: null,
    };
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [data, setData] = useState(initData);
    const [currentData, setCurrentData] = useState(initData);
    const [dataChanged, setDataChanged] = useState(false);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Product name is required').min(2, 'Name must be at least 2 characters'),
        sku: Yup.string().required('SKU is required'),
        price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
        stock_quantity: Yup.number().required('Stock quantity is required').min(0, 'Stock must be non-negative'),
        category_id: Yup.string().required('Category is required'),
        description: Yup.string(),
        short_description: Yup.string(),
        sale_price: Yup.number().min(0, 'Sale price must be positive').nullable(),
    });

    const handleTextChange = (e) => {
        const { name, value, type } = e.target;
        setData((prevState) => ({
            ...prevState,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
        }));
        setDataChanged(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setErrors({ image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ image: 'Image size must be less than 5MB' });
                return;
            }

            setData((prevState) => ({
                ...prevState,
                image: file,
            }));
            setDataChanged(true);
            setErrors((prev) => ({ ...prev, image: null }));
        }
    };

    const removeImage = () => {
        setData((prevState) => ({
            ...prevState,
            image: null,
        }));
        setDataChanged(true);
        // Reset file input
        const fileInput = document.getElementById('image-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        try {
            await validationSchema.validate(data, { abortEarly: false });

            if (type === 'create') {
                try {
                    const response = await productService.createProduct(data);
                    if (response.statusCode === 200) {
                        toast.success(response.message || 'Product created successfully', {
                            duration: 5000,
                        });
                        navigate('/admin/products');
                    }
                } catch (error) {
                    if (error.response?.data?.errorMessages) {
                        const errorMessages = error.response.data.errorMessages;
                        const formErrors = {};
                        for (const [key, value] of Object.entries(errorMessages)) {
                            formErrors[key] = Array.isArray(value) ? value[0] : value;
                        }
                        setErrors(formErrors);
                    } else {
                        toast.error(handleProductApiError(error));
                    }
                } finally {
                    setProcessing(false);
                }
            } else {
                try {
                    const response = await productService.updateProduct(slug, data);
                    if (response.statusCode === 200) {
                        toast.success(response.message || 'Product updated successfully', {
                            duration: 5000,
                        });
                        navigate('/admin/products');
                    }
                } catch (error) {
                    if (error.response?.data?.errorMessages) {
                        const errorMessages = error.response.data.errorMessages;
                        const formErrors = {};
                        for (const [key, value] of Object.entries(errorMessages)) {
                            formErrors[key] = Array.isArray(value) ? value[0] : value;
                        }
                        setErrors(formErrors);
                    } else {
                        toast.error(handleProductApiError(error));
                    }
                } finally {
                    setProcessing(false);
                }
            }
        } catch (validationError) {
            const formErrors = {};
            validationError.inner.forEach((error) => {
                formErrors[error.path] = error.message;
            });
            setErrors(formErrors);
            setProcessing(false);
        }
    };

    const onChangeChecked = (field, value) => {
        setData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
        setDataChanged(true);
    };

    const getCategories = async () => {
        try {
            const response = await productService.getCategories();
            setCategories(response.data);
        } catch (error) {
            setErrors({ categoriesApiError: handleProductApiError(error) });
        }
    };

    const getProduct = async () => {
        setProcessing(true);
        try {
            const response = await productService.getProduct(slug);
            const formData = formatProductForForm(response.data);
            
            setData(formData);
            setCurrentData(formData);
            setProcessing(false);
        } catch (error) {
            setProcessing(false);
            setErrors({ getProductError: handleProductApiError(error) });
            toast.error('Failed to load product data');
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        if (type === 'edit') getProduct();
    }, [type, slug]);

    const handleCategoryChange = (categoryId) => {
        setData((prevState) => ({
            ...prevState,
            category_id: categoryId,
        }));
        setDataChanged(true);
    };

    return (
        <div className="relative h-full p-4">
            <Loader isLoading={processing} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="mb-4 text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <AppLabel required htmlFor="name">
                                Product Name
                            </AppLabel>
                            <Input
                                onChange={handleTextChange}
                                value={data.name}
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter product name"
                                className="w-full"
                            />
                            <InputError className="mt-1" message={errors.name} />
                        </div>

                        <div>
                            <AppLabel required htmlFor="sku">
                                SKU
                            </AppLabel>
                            <Input
                                onChange={handleTextChange}
                                value={data.sku}
                                type="text"
                                id="sku"
                                name="sku"
                                placeholder="Product SKU"
                                className="w-full"
                            />
                            <InputError className="mt-1" message={errors.sku} />
                        </div>

                        <div>
                            <AppLabel required htmlFor="category_id">
                                Category
                            </AppLabel>
                            <Select value={data.category_id} onValueChange={handleCategoryChange} disabled={categories.length === 0}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.value} value={category.value.toString()}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError className="mt-1" message={errors.category_id || errors.categoriesApiError} />
                        </div>

                        <div className="md:col-span-2">
                            <AppLabel htmlFor="short_description">Short Description</AppLabel>
                            <textarea
                                onChange={handleTextChange}
                                value={data.short_description}
                                id="short_description"
                                name="short_description"
                                placeholder="Brief product description"
                                rows={2}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <InputError className="mt-1" message={errors.short_description} />
                        </div>

                        <div className="md:col-span-2">
                            <AppLabel htmlFor="description">Full Description</AppLabel>
                            <textarea
                                onChange={handleTextChange}
                                value={data.description}
                                id="description"
                                name="description"
                                placeholder="Detailed product description"
                                rows={4}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <InputError className="mt-1" message={errors.description} />
                        </div>
                    </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="mb-4 text-lg font-medium">Pricing & Inventory</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <AppLabel required htmlFor="price">
                                Regular Price ($)
                            </AppLabel>
                            <Input
                                onChange={handleTextChange}
                                value={data.price}
                                type="number"
                                step="0.01"
                                min="0"
                                id="price"
                                name="price"
                                placeholder="0.00"
                                className="w-full"
                            />
                            <InputError className="mt-1" message={errors.price} />
                        </div>

                        <div>
                            <AppLabel htmlFor="sale_price">Sale Price ($)</AppLabel>
                            <Input
                                onChange={handleTextChange}
                                value={data.sale_price}
                                type="number"
                                step="0.01"
                                min="0"
                                id="sale_price"
                                name="sale_price"
                                placeholder="0.00"
                                className="w-full"
                            />
                            <InputError className="mt-1" message={errors.sale_price} />
                        </div>

                        <div>
                            <AppLabel required htmlFor="stock_quantity">
                                Stock Quantity
                            </AppLabel>
                            <Input
                                onChange={handleTextChange}
                                value={data.stock_quantity}
                                type="number"
                                min="0"
                                id="stock_quantity"
                                name="stock_quantity"
                                placeholder="0"
                                className="w-full"
                            />
                            <InputError className="mt-1" message={errors.stock_quantity} />
                        </div>
                    </div>
                </div>
                {/* Product Status */}
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="mb-4 text-lg font-medium">Product Status</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-4 rounded-md border p-4">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm leading-none font-medium">Product Active</p>
                                <p className="text-sm text-muted-foreground">Controls whether this product is visible and available for purchase.</p>
                            </div>
                            <Switch onCheckedChange={(value) => onChangeChecked('is_active', value)} checked={data.is_active} />
                        </div>

                        <div className="flex items-center space-x-4 rounded-md border p-4">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm leading-none font-medium">In Stock</p>
                                <p className="text-sm text-muted-foreground">Indicates whether this product is currently in stock.</p>
                            </div>
                            <Switch onCheckedChange={(value) => onChangeChecked('in_stock', value)} checked={data.in_stock} />
                        </div>
                    </div>
                </div>

                {/* Product Image */}
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="mb-4 text-lg font-medium">Product Image</h3>
                    <div className="space-y-4">
                        <div>
                            <AppLabel htmlFor="image">Product Image</AppLabel>
                            <Input 
                                type="file" 
                                id="image-upload" 
                                name="image" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="w-full" 
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Upload a single product image. Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
                            </p>
                            <InputError className="mt-1" message={errors.image} />
                        </div>

                        {/* Image Preview */}
                        {(data.image || (type === 'edit' && currentData.image)) && (
                            <div className="relative inline-block">
                                <img 
                                    src={
                                        data.image instanceof File 
                                            ? URL.createObjectURL(data.image) 
                                            : currentData.image_url || currentData.featured_image
                                    } 
                                    alt="Product preview" 
                                    className="h-32 w-32 rounded-md border object-cover" 
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="rounded-lg border bg-gray-50 p-6">
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" disabled={processing} onClick={() => navigate('/admin/products')}>
                            Cancel
                        </Button>
                        {type === 'edit' && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!dataChanged || processing}
                                onClick={() => {
                                    setData(currentData);
                                    setDataChanged(false);
                                    setErrors({});
                                    toast.success('Changes have been reset');
                                }}
                            >
                                Reset Changes
                            </Button>
                        )}
                        <Button type="submit" disabled={processing} className="min-w-32">
                            {processing ? 'Saving...' : type === 'edit' ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                    {(errors.submitError || errors.getProductError) && (
                        <InputError className="mt-2" message={errors.submitError || errors.getProductError} />
                    )}
                </div>
            </form>
        </div>
    );
};
export default CreateOrUpdateProduct;

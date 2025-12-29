export interface MenuItem {
    id: number;
    name: string;
    ingredients: string;
    price: number;
    imageUrl: string;
    displayUrl?: string; // For optimized Cloudinary display
    category: string;
    featured: boolean;
}

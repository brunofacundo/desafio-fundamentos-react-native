import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
    id: string;
    title: string;
    image_url: string;
    price: number;
    quantity: number;
}

interface CartContext {
    products: Product[];
    addToCart(item: Product): void;
    increment(id: string): void;
    decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function loadProducts(): Promise<void> {
            const localProducts = await AsyncStorage.getItem('@GoMarketplace:products');

            if (localProducts) {
                setProducts(JSON.parse(localProducts));
            }
        }

        loadProducts();
    }, []);

    const addToCart = useCallback(async product => {
        setProducts(oldProducts => {
            let existProduct = false;

            const newProducts = oldProducts.map(item => {
                if (item.id === product.id) {
                    existProduct = true;

                    return {
                        ...item,
                        quantity: item.quantity + 1
                    };
                }

                return item;
            });

            if (!existProduct) {
                newProducts.push(product);
            }

            AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newProducts));

            return newProducts;
        });
    }, []);

    const increment = useCallback(async id => {
        setProducts(oldProducts => {
            const newProducts = oldProducts.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        quantity: item.quantity + 1
                    };
                }

                return item;
            });

            AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newProducts));

            return newProducts;
        });
    }, []);

    const decrement = useCallback(async id => {
        setProducts(oldProducts => {
            const newProducts = oldProducts
                .map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            quantity: item.quantity - 1
                        };
                    }

                    return item;
                })
                .filter(item => item.quantity > 0);

            AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newProducts));

            return newProducts;
        });
    }, []);

    const value = React.useMemo(() => ({ addToCart, increment, decrement, products }), [
        products,
        addToCart,
        increment,
        decrement
    ]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error(`useCart must be used within a CartProvider`);
    }

    return context;
}

export { CartProvider, useCart };

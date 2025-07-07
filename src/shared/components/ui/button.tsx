import * as React from 'react';

import { Pressable, Text, View, type PressableProps } from 'react-native';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/src/lib/utils';

const buttonVariants = cva(
  'flex flex-row items-center justify-center rounded-md transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outline: 'border border-border bg-background',
        secondary: 'bg-secondary',
        ghost: '',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-12 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva('text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-white',
      destructive: 'text-white',
      outline: 'text-foreground',
      secondary: 'text-white',
      ghost: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        props.disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {({ pressed }) => {
        // Check if children is text content (string, number, or array of strings/numbers)
        const isTextContent = typeof children === 'string' || 
                            typeof children === 'number' ||
                            (Array.isArray(children) && children.every(child => 
                              typeof child === 'string' || typeof child === 'number'
                            ));
        
        if (isTextContent) {
          return (
            <Text
              className={cn(
                buttonTextVariants({ variant }),
                pressed && 'opacity-80'
              )}
            >
              {children}
            </Text>
          );
        }
        
        // For React elements, wrap in a View to handle press opacity
        return (
          <View style={pressed ? { opacity: 0.8 } : undefined}>
            {children}
          </View>
        );
      }}
    </Pressable>
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
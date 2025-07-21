import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hideElements(elements: HTMLElement[]) {
  elements.forEach((element) => {
    element.style.visibility = "hidden";
  });

  return {
    restore: () => {
      elements.forEach((element) => {
        element.style.visibility = "visible";
      });
    },
  };
}

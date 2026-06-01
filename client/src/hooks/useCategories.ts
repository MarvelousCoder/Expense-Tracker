// src/hooks/useCategories.ts
import { useQuery } from "@tanstack/react-query"
import { categoryService } from "@/services/category.service"

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: categoryService.getAll,
        staleTime: 10 * 60 * 1000, // categories rarely change — cache 10 min
    })
}
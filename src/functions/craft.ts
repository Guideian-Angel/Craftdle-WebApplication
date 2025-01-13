import { INonShapelessRecipe, IRecipeCollection, IShapelessRecipe } from "../interfaces/IRecipe";

type ICraftingTable = Array<Array<HTMLImageElement | null>>;

function removeEmptyRows(recipe: INonShapelessRecipe | ICraftingTable) {
    for (let a = 0; a < 2; a++) {
        for (let i = 0; i < recipe.length; i++) {
            let isAllNull = true
            if (i != 1 || recipe.length < 3) {
                recipe[i].forEach(material => {
                    if (material != null) isAllNull = isAllNull && false
                });
                if (isAllNull) {
                    recipe.splice(i, 1)
                    i--
                }
            }
        }
        for (let i = 0; i < recipe[0]?.length; i++) {
            let isAllNull = true
            if (i != 1 || recipe[0].length < 3) {
                for (let j = 0; j < recipe.length; j++) {
                    if (recipe[j][i] != null) isAllNull = isAllNull && false
                }
                if (isAllNull) {
                    for (let j = 0; j < recipe.length; j++) {
                        recipe[j].splice(i, 1)
                    }
                    i--
                }
            }
        }
    }
    return recipe as any[][]
}

function convertToNonShapeless(craftingTable: ICraftingTable): INonShapelessRecipe {
    return craftingTable.map(row => row.map(cell => {
        if (cell) {
            const classList = Array.from(cell.classList).filter(className => className !== "item");
            return classList.length > 0 ? classList[0] : null;
        }
        return null;
    })) as INonShapelessRecipe;
}

function matchRequiredItems(items: string[], requiredItems: Array<Array<string> | string>): boolean {
    for (let requiredItem of requiredItems) {
        if (Array.isArray(requiredItem)) {
            let contain = false;
            for (let item of requiredItem) {
                if (items.includes(item)) {
                    items.splice(items.indexOf(item), 1);
                    contain = true;
                    break;
                }
            }
            if (!contain) return false;
        } else {
            if (!items.includes(requiredItem)) return false;
            items.splice(items.indexOf(requiredItem), 1);
        }
    }
    return true;
}

function matchOptionalItems(items: string[], optionalItems: Array<Array<string> | string>): boolean {
    for (let optionalItem of optionalItems) {
        if (Array.isArray(optionalItem)) {
            let contain = false;
            for (let item of optionalItem) {
                if (items.includes(item)) {
                    items.splice(items.indexOf(item), 1);
                    contain = true;
                    break;
                }
            }
            if (!contain) return false;
        } else {
            if (items.includes(optionalItem)) {
                items.splice(items.indexOf(optionalItem), 1);
            }
        }
    }
    return true;
}

function matchShapelessRecipe(items: string[], requiredItems: Array<Array<string> | string>, optionalItems?: Array<Array<string> | string>): boolean {
    if (!matchRequiredItems(items, requiredItems)) return false;
    if (items.length > 0 && optionalItems && !matchOptionalItems(items, optionalItems)) return false;
    return items.length === 0;
}

function matchNonShapelessRecipe(filteredCraftingTable: Array<Array<string | null>>, filteredRecipe: INonShapelessRecipe): boolean {
    if (filteredCraftingTable.length !== filteredRecipe.length || filteredCraftingTable[0].length !== filteredRecipe[0].length) {
        return false;
    }

    for (let i = 0; i < filteredCraftingTable.length; i++) {
        for (let j = 0; j < filteredCraftingTable[i].length; j++) {
            if (!filteredRecipe[i][j]?.includes(filteredCraftingTable[i][j] ?? "") && filteredRecipe[i][j] != filteredCraftingTable[i][j]) {
                return false;
            }
        }
    }
    return true;
}

export function craft(craftingTable: ICraftingTable, recipes: IRecipeCollection) {
    const filteredCraftingTable: Array<Array<string | null>> = removeEmptyRows(convertToNonShapeless(craftingTable));

    for (let recipeGroup in recipes) {
        for (let recipe of recipes[recipeGroup]) {
            if (recipe.shapeless) {
                let items = filteredCraftingTable.flat(3).filter(cell => cell !== null);
                const { required, optional } = recipe.recipe as IShapelessRecipe;
                if (matchShapelessRecipe(items, required, optional)) {
                    return {
                        group: recipeGroup,
                        id: recipe.id
                    };
                }
            } else {
                const nonShapelessRecipe = recipe.recipe as INonShapelessRecipe;
                const filteredRecipe = removeEmptyRows(nonShapelessRecipe);

                if (matchNonShapelessRecipe(filteredCraftingTable, filteredRecipe)) {
                    return {
                        group: recipeGroup,
                        id: recipe.id
                    };
                }
            }
        }
    }
    return null;
}
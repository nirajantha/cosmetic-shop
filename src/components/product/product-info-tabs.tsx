import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductInfoTabsProps {
  description: string;
  ingredients: string | null;
  howToUse: string | null;
}

export function ProductInfoTabs({ description, ingredients, howToUse }: ProductInfoTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        {ingredients && <TabsTrigger value="ingredients">Ingredients</TabsTrigger>}
        {howToUse && <TabsTrigger value="how-to-use">How to Use</TabsTrigger>}
      </TabsList>
      <TabsContent value="description" className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </TabsContent>
      {ingredients && (
        <TabsContent value="ingredients" className="text-sm leading-relaxed text-muted-foreground">
          {ingredients}
        </TabsContent>
      )}
      {howToUse && (
        <TabsContent value="how-to-use" className="text-sm leading-relaxed text-muted-foreground">
          {howToUse}
        </TabsContent>
      )}
    </Tabs>
  );
}

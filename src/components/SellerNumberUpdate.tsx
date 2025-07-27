import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bot, Phone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SellerNumberResponse {
  seller: any;
  whatsappNumber: string;
}

const SellerNumberUpdate = () => {
  const [newNumber, setNewNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current seller number
  const {
    data: currentNumberData,
    isLoading: isLoadingCurrent,
    error: currentError,
  } = useQuery({
    queryKey: ["sellerNumber"],
    queryFn: async (): Promise<SellerNumberResponse> => {
      const response = await fetch(
        "https://digital-server1.onrender.com/orders/get-seller-number"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch seller number");
      }
      return response.json();
    },
  });

  console.log(
    "Current Seller Number Data:",
    currentNumberData.seller.whatsappNumber
  );

  // Update seller number mutation
  const updateNumberMutation = useMutation({
    mutationFn: async (number: string) => {
      const response = await fetch(
        "https://digital-server1.onrender.com/orders/update-number",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ whatsappNumber: number }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update seller number");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Seller number updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["sellerNumber"] });
      setNewNumber("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update seller number",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid seller number",
        variant: "destructive",
      });
      return;
    }
    updateNumberMutation.mutate(newNumber.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)] border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-primary-glow p-3 rounded-full shadow-lg">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Hi Mr Monir
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            I am your bot. Please change your seller number here. I am there to
            update this.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sellerNumber" className="text-sm font-medium">
                New Seller Number
              </Label>
              <Input
                id="sellerNumber"
                type="text"
                placeholder="Enter your seller number"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="h-12 border-2 focus:border-primary transition-colors"
                disabled={updateNumberMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-200 font-semibold"
              disabled={updateNumberMutation.isPending || !newNumber.trim()}
            >
              {updateNumberMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Number
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Current Number:
              </span>
              {isLoadingCurrent ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : currentError ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Error loading</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm bg-accent px-2 py-1 rounded">
                    {currentNumberData?.seller.whatsappNumber || "Not set"}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This is your current number
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerNumberUpdate;

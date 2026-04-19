import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Search, FileCheck, Upload, Mail, AlertCircle, IdCard } from "lucide-react";
import BackButton from "@/components/BackButton";

const VerifyProperty = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    documentTitle: "",
    propertyType: "",
    description: "",
    authorityLetter: null,
    ninCard: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Scroll to results section
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendEmail = () => {
    // Email sending functionality would be implemented here
    console.log("Sending email...");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)] z-0" />
      
      {/* Header with Back Button */}
      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0">
        <div className="container flex h-16 items-center">
          <BackButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 bg-[linear-gradient(135deg,rgba(238,241,255,0.6)_0%,rgba(233,236,255,0.6)_100%)] py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-[#26225f]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[#1f1a54] mb-6">
            Don't Get Scammed
          </h1>
          <p className="text-xl md:text-2xl text-[#6f7599] mb-4">
            Find out all you need to know about that property
          </p>
          <div className="flex items-center justify-center gap-2 text-lg text-[#6f7599]">
            <Search className="h-5 w-5" />
            <span>You can search right from your home, office or during the meeting</span>
          </div>
        </div>
      </section>

      {/* Statement Section */}
      <section className="relative z-10 py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <FileCheck className="h-12 w-12 text-[#26225f] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#1f1a54]">Verify Documents</h3>
              <p className="text-[#6f7599]">
                Authenticate property documents and ownership certificates
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Search className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Search Anywhere</h3>
              <p className="text-muted-foreground">
                Conduct property searches from the comfort of your location
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Stay Protected</h3>
              <p className="text-muted-foreground">
                Avoid property fraud with comprehensive verification
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Application for Search</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="document-title">Title of Document</Label>
                  <Select onValueChange={(value) => setFormData({...formData, documentTitle: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coo">Certificate of Occupancy (C of O)</SelectItem>
                      <SelectItem value="roo">Right of Occupancy (R of O)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property-type">Property Type</Label>
                  <Select onValueChange={(value) => setFormData({...formData, propertyType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Document Upload</Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Provide a brief description of the property and documents"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authority-letter" className="text-sm">Letter of Authority from Property Owner</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload letter of authority approving search
                      </p>
                      <Input 
                        type="file" 
                        id="authority-letter"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <Label 
                        htmlFor="authority-letter" 
                        className="cursor-pointer text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        Choose File
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nin-card" className="text-sm">ID Card Upload (NIN)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <IdCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload your National Identification Number (NIN) card
                      </p>
                      <Input 
                        type="file" 
                        id="nin-card"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <Label 
                        htmlFor="nin-card" 
                        className="cursor-pointer text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        Choose File
                      </Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {submitted && (
        <section id="results-section" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="h-16 w-16 text-destructive" />
                </div>
                <CardTitle className="text-2xl text-center">Search Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
                  <p className="text-lg text-foreground leading-relaxed">
                    Sorry, we don't have enough information in our database to conclude this search. 
                    Please visit <strong>AGIS</strong> (Abuja Geographic Information Systems) for a full 
                    verification process as to the status of the property.
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reference Number:</span>
                        <p className="font-mono">VER-{Date.now().toString().slice(-8)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Search Date:</span>
                        <p>{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-primary font-semibold text-xl italic">
                    "Make smart and safe deals."
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleSendEmail} className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Send Result to Email</span>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://agis.fct.gov.ng" target="_blank" rel="noopener noreferrer">
                      Visit AGIS Website
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
};

export default VerifyProperty;
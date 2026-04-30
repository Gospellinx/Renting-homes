import { Message } from "@/components/ChatBot"; // We will define Message type centrally or just use local type

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function smartMockStreamChat({
  messages,
  onDelta,
  onDone,
  isMainSearch = false,
}: {
  messages: ChatMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
  isMainSearch?: boolean;
}) {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Extract intent
  const isRent = lastMessage.includes("rent") || lastMessage.includes("lease");
  const isBuy = lastMessage.includes("buy") || lastMessage.includes("sale") || lastMessage.includes("purchase");
  const isJv = lastMessage.includes("jv") || lastMessage.includes("joint venture");
  const isVerify = lastMessage.includes("verify") || lastMessage.includes("verification") || lastMessage.includes("legit");
  
  // Extract property type
  const isShop = lastMessage.includes("shop") || lastMessage.includes("store") || lastMessage.includes("retail") || lastMessage.includes("plaza");
  const isApartment = lastMessage.includes("apartment") || lastMessage.includes("flat");
  const isDuplex = lastMessage.includes("duplex") || lastMessage.includes("terrace") || lastMessage.includes("semi-detached");
  const isVilla = lastMessage.includes("villa") || lastMessage.includes("mansion");
  
  // Extract location
  const isAbuja = lastMessage.includes("abuja") || lastMessage.includes("wuse") || lastMessage.includes("maitama") || lastMessage.includes("garki") || lastMessage.includes("asokoro") || lastMessage.includes("jabi") || lastMessage.includes("gwarinpa");
  const isLagos = lastMessage.includes("lagos") || lastMessage.includes("lekki") || lastMessage.includes("ikoyi") || lastMessage.includes("victoria island") || lastMessage.includes("banana island") || lastMessage.includes("ajah");
  
  // Base responses
  let responseText = isMainSearch 
    ? "I'm looking through our database for you. Let me know if you need to adjust your budget, location, or the type of property."
    : "I'm your HomesNG assistant! I can help you find properties, answer questions about locations, or guide you through property verification. What are you looking for today?";

  // Construct dynamic response
  if (isVerify) {
    responseText = "Property verification is crucial to avoid scams. Our legal team can help you verify any property title, C of O, and ownership history before you make a payment. Would you like me to guide you to the verification portal?";
  } else if (isJv) {
    responseText = "Joint Ventures are a great way to maximize ROI. We have several prime land options in Abuja and Lagos open for JV development. Are you bringing the land or the capital?";
  } else {
    // Property search logic
    let propertyStr = "properties";
    if (isShop) propertyStr = "commercial spaces and shops";
    else if (isApartment) propertyStr = "apartments";
    else if (isDuplex) propertyStr = "duplexes";
    else if (isVilla) propertyStr = "luxury villas and mansions";

    let intentStr = "";
    if (isRent) intentStr = "for rent";
    else if (isBuy) intentStr = "for sale";

    let locStr = "";
    if (isAbuja) locStr = "in Abuja";
    else if (isLagos) locStr = "in Lagos";

    if (isRent || isBuy || isShop || isApartment || isDuplex || isVilla || isAbuja || isLagos) {
      if (isMainSearch) {
        responseText = `I've updated the list to show ${propertyStr} ${intentStr} ${locStr}. Do you have a specific budget in mind so I can narrow it down further?`;
      } else {
        responseText = `Great! I can help you find ${propertyStr} ${intentStr} ${locStr}. To give you the best recommendations, what is your budget range, and how many bedrooms or how much space do you need?`;
      }
    }
  }

  // Cleanup extra spaces
  responseText = responseText.replace(/\s+/g, ' ').trim();

  // Simulate streaming
  const words = responseText.split(" ");
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 40));
    onDelta(words[i] + " ");
  }
  onDone();
}

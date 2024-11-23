import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";

const questions = [
  {
    question: "How many financial institutions can I connect to?",
    answer: `Currently, we support over 5000 banks, brokerages and other financial institutions in 46 countries. We are working on expanding this number.`,
  },
  {
    question: "Does Guilders have access to my bank credentials?",
    answer: `No, Guilders uses third party financial account aggregator services to connect to your bank and brokerage accounts. Your credentials are directly passed to the aggregator and never seen or stored by Guilders. The providers provide read-only data to Guilders, therefore we cannot make any transactions on your behalf.`,
  },
  {
    question: "How does Guilders make money?",
    answer: `We are currently free for early adopters. Due to the cost of making financial connections and offering AI services, we may charge a subscription fee in the future.`,
  },
  {
    question: "Does Guilders sell my data?",
    answer: `Guilders NEVER sells your data.

    Guilders is a privacy-focused business. We don't sell your data and we don't use it for any other purpose than to provide you value. We plan to offer a subscription-based model in the future, but we will never sell your data to third parties.

    In specific scenarios, when data is shared with third parties like Anthropic (for AI services), we make sure they comply with the highest privacy standards.`,
  },
  {
    question: "Is my data secure?",
    answer: `Yes, your data is secure with Guilders. We encrypt all data at rest and in transit, and we only accept HTTPS secure connections. We also don't store any of your banking credentials.`,
  },
  {
    question: "What happens if Guilders servers are breached?",
    answer: `We take the security of our systems very seriously.

    First of all, we don't store any of your banking credentials. They are passed directly to the aggregator and never stored by Guilders, so even if our systems were breached, your credentials would be safe.

    Secondly, we encrypt all data at rest and in transit, so even if someone gets access to our database, they won't be able to read your data because they would need the decryption key.`,
  },
  {
    question: "What happens when I delete my account?",
    answer: `When you delete your account, we delete all your data from our database immediately and notify our aggregators to stop connecting your account and delete everything from their end.`,
  },
];

export const FAQ = () => (
  <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto">
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="flex gap-10 flex-col">
          <div className="flex gap-4 flex-col">
            <div>
              <Badge variant="outline">FAQ</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-left font-regular">
                Frequently Asked Questions
              </h4>
            </div>
            <div className="">
              <Button className="gap-4" variant="outline">
                Any questions? Reach out <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full whitespace-pre-line"
        >
          {questions.map((question, index) => (
            <AccordionItem key={index} value={"index-" + index}>
              <AccordionTrigger>{question.question}</AccordionTrigger>
              <AccordionContent>{question.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </div>
);

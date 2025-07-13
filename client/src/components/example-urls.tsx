import { Button } from "@/components/ui/button";

interface ExampleUrlsProps {
  onExampleSelect: (url: string) => void;
}

const exampleUrls = [
  {
    url: "https://github.com",
    name: "GitHub",
    icon: "🐙",
    domain: "github.com"
  },
  {
    url: "https://stripe.com",
    name: "Stripe",
    icon: "💳",
    domain: "stripe.com"
  },
  {
    url: "https://notion.so",
    name: "Notion",
    icon: "📝",
    domain: "notion.so"
  },
  {
    url: "https://vercel.com",
    name: "Vercel",
    icon: "🚀",
    domain: "vercel.com"
  }
];

export function ExampleUrls({ onExampleSelect }: ExampleUrlsProps) {
  return (
    <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Try these example URLs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {exampleUrls.map((example) => (
          <Button
            key={example.url}
            variant="outline"
            className="text-left p-3 h-auto justify-start hover:border-primary hover:bg-blue-50 transition-all duration-200 group"
            onClick={() => onExampleSelect(example.url)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-200 text-sm">
                {example.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{example.name}</div>
                <div className="text-gray-500 text-xs">{example.domain}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

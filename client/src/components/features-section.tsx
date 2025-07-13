import { Zap, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast & Accurate",
    description: "Instantly extract metadata from any website with high accuracy and speed.",
    bgColor: "bg-blue-100",
    iconColor: "text-primary"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your URLs are processed securely without storing any personal data.",
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Beautiful previews that work perfectly on all devices and screen sizes.",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  }
];

export function FeaturesSection() {
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div key={feature.title} className="text-center">
            <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`${feature.iconColor} w-6 h-6`} />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">{feature.title}</h4>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}

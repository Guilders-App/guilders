import { Markdown } from "@/components/landing-page/markdown";

const privacyPolicyContent = `
# Privacy Policy

Your privacy is important to us. It is Maybe Finance, Inc.'s policy to respect your privacy and comply with any applicable law and regulation regarding any personal information we may collect about you, including across our website, maybe.co, and other sites we own and operate.

Personal information is any information about you which can be used to identify you. This includes information about you as a person (such as name, address, and date of birth), your devices, payment details, and even information about how you use a website or online service.

In the event our site contains links to third-party sites and services, please be aware that those sites and services have their own privacy policies. After following a link to any third-party content, you should read their posted privacy policy information about how they collect and use personal information. This Privacy Policy does not apply to any of your activities after you leave our site.

## 1. Information We Collect
Information we collect falls into one of two categories: “voluntarily provided” information and “automatically collected” information.

“Voluntarily provided” information refers to any information you knowingly and actively provide us when using or participating in any of our services and promotions.

“Automatically collected” information refers to any information automatically sent by your devices in the course of accessing our products and services.

### Log Data
When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your device’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details about your visit.

Additionally, if you encounter certain errors while using the site, we may automatically collect data about the error and the circumstances surrounding its occurrence. This data may include technical details about your device, what you were trying to do when the error happened, and other technical information relating to the problem. You may or may not receive notice of such errors, even in the moment they occur, that they have occurred, or what the nature of the error is.

### Device Data
When you visit our website or interact with our services, we may automatically collect data about your device, such as:

- Device Type
- Operating System
- Device settings
- Geo-location data

Data we collect can depend on the individual settings of your device and software. We recommend checking the policies of your device manufacturer or software provider to learn what information they make available to us.

Please be aware that while this information may not be personally identifying by itself, it may be possible to combine it with other data to personally identify individual persons.

### Personal Data
We may ask for personal information — for example, when you subscribe to our newsletter or when you contact us — which may include one or more of the following:

- Name
- Email
- Social media profiles
- Date of birth
- Phone/mobile number
- Home/mailing address

### Transaction Data
Transaction data refers to data that accumulates over the normal course of operation on our platform. This may include transaction records, stored files, user profiles, analytics data and other metrics, as well as other types of information, created or generated, as users interact with our services.
`;

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Markdown content={privacyPolicyContent} />
    </div>
  );
}

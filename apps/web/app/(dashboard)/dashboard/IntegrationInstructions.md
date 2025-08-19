## Easy Auth Integration (Supabase & Clerk)

### For Supabase Auth Users
Paste this code in your frontend after user login/signup:

```js
import { supabase } from './your-supabase-client'

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    window.viq && window.viq('identify', {
      email: session.user.email,
      name: session.user.user_metadata?.full_name,
      phone: session.user.phone
    });
  }
});
```

### For Clerk Auth Users
Paste this code in your frontend after user login/signup:

```js
import { useUser } from "@clerk/clerk-react";

function MyApp() {
  const { user } = useUser();
  React.useEffect(() => {
    if (user) {
      window.viq && window.viq('identify', {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        phone: user.primaryPhoneNumber?.phoneNumber
      });
    }
  }, [user]);
  // ...rest of your app
}
```

**Instructions:**
- Copy and paste the relevant code into your project.
- No backend changes needed. VisitorIQ will automatically link device info to user accounts for fraud detection, repeat signups, and analytics.

For questions, contact support or see the [API Docs](/app/docs/api.md).

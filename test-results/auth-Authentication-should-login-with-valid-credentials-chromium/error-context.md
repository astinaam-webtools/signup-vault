# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e8]: Secure workspace
      - heading "Welcome back to SignupVault" [level=1] [ref=e9]
      - paragraph [ref=e10]: Log in to manage projects, monitor submissions, and export contacts. Your session respects your system theme automatically.
      - generic [ref=e11]:
        - generic [ref=e12]: Encrypted sessions
        - generic [ref=e13]: Role-aware access
        - generic [ref=e14]: Coolify-ready stack
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]:
          - paragraph [ref=e18]: Login
          - paragraph [ref=e19]: Admin dashboard
        - generic [ref=e20]: SV
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: Email
          - textbox "Email" [ref=e24]:
            - /placeholder: Enter your email
            - text: admin@signupvault.com
        - generic [ref=e25]:
          - generic [ref=e26]: Password
          - textbox "Password" [ref=e27]:
            - /placeholder: ""
            - text: admin123
        - generic [ref=e28]: Invalid credentials
        - button "Sign in" [ref=e29]
      - link "Forgot password?" [ref=e31] [cursor=pointer]:
        - /url: /login/reset
  - button "Open Next.js Dev Tools" [ref=e37] [cursor=pointer]:
    - img [ref=e38]
  - alert [ref=e41]
```
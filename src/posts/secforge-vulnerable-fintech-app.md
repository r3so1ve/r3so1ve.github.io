---
title: Building My Own Vulnerable Fintech App (Instead of Using Juice Shop)
date: 2026-07-21
sev: info
tag: web
summary: "Phase 0 was about building the walls. This post is about something worth attacking: a banking app I created to be broken on purpose. Why I built it instead of downloading Juice Shop, and what came out when I attacked it."
topics:
  - appsec
  - sqli
draft: false
---
This is the second post in the SecForge series. The [first one](/posts/secforge-network-segmentation.html) built the walls: three network zones with a firewall between them, and one web server sitting in the DMZ with nothing on it yet. This post puts something in that DMZ worth attacking, which is a small online-banking app for my fictional company, SecForge Industries. I wrote it myself, and I wrote it to be broken on purpose. All vulns are kind of easy to exploit, but they happen in real life, so as a demo I wanted to depict them.

## The short version


I needed a target. The easiest option is to download OWASP Juice Shop or DVWA, point my tools at it, and call it a lab. Instead I spent a weekend writing my own vulnerable banking app in Flask, with thirteen planted flaws across the OWASP Top 10. This post is about why that was a right thing to do and what the app looks like. Step by step exploitation of each flaw, as well as part where one tool confidently told me there was no vulnerability when there absolutely was, is in here too.

<div class="callout callout-warn">
This app is insecure by design. It has SQL injection, plaintext card numbers, server-side request forgery, and a remote-code-execution path through Flask's debug console. It lives on one isolated host in my lab DMZ, behind the segmentation from Phase 0, and it never touches the internet. Do not run anything like this anywhere another person can reach it.
</div>

![](../assets/Screenshot%202026-06-22%20165146.jpg)
_Figure 1. SecForge Vault, the customer login. Looks like a bank. Behaves like a minefield._

## Why not just use Juice Shop or DVWA?

Those projects are excellent. But they have two problems for what I'm trying to do.

The first is that everyone has already seen them. The bugs are documented, the walkthroughs are everywhere, and the muscle you build is partly muscle memory for that specific app. I wanted to find bugs in something nobody has written a cheat sheet for, including me, a few weeks after I wrote it.

The second problem is the more crucial one. Generic vulnerable apps are full of the textbook web bugs, like injection, broken access control, cross-site scripting, but they are thin on **business-logic flaws**. A business-logic flaw is when every individual request is technically valid and the app still does something it should never do, because the rules of the business were never enforced in code. In a bank, that is the category that actually moves money. A transfer of a negative amount for example, which is also in this post. An overdraft that the server never checks. Two simultaneous withdrawals that both see the same balance. No scanner flags these, because nothing is malformed. You only find them if the app models a real domain with real rules, and a generic target does not.

So I built a bank. A small one, but a real domain with balances, transfers, cards, and statements, so the logic bugs can exist.

## What I built: SecForge Vault

It is a Flask app with a SQLite database, server-rendered pages for the browser, and a small JSON API on the side for a token-based client. The surface looks like a stripped-down banking portal:

- **Accounts and a dashboard** with a balance and recent activity.
- **Transfers** between accounts by account number.
- **Cards**, showing the card on file.
- **Statements** you can download.
- **A profile** with a bio and an "import avatar from a URL" feature.
- **An admin panel** for staff to view users and adjust balances.
- **A JSON API** that issues a token at login and serves account data.

![](../assets/Screenshot%202026-06-17%20174411.jpg)
_Figure 2. A customer dashboard after logging in. Balance, account number, recent transactions. Everything an attacker wants in one place._

Every one of those features is a door I left unlocked in a specific, documented way.

## Four rules I built it by

The design is the actual content of this post, so here are the rules I followed. 

**One: every flaw is a single marked sink, not general sloppiness.** Each vulnerability is one place in the code, tagged with a comment like `INTENTIONAL VULN V-01`. The rest of that file is written normally. This matters because the "fixed" version of any bug is one diff away which makes the before and after for the compliance write-up real instead of hand-waved.

**Two: vulnerable, but not silent.** The app is full of holes, but it logs every security-relevant action, like for instance every login attempt failed or successful, every transfer, every admin access, every avatar fetch, as a line of JSON. That log is the whole point for a later phase, where I will write detection rules against the exact attacks I run here. A target you can attack but can never detect only teaches 50% of the lesson.

**Three: one app, reused across the whole series.** This same bank is the thing I attack now, the thing I map to SOC 2 and ISO 27001 controls in the GRC post, and the thing I detect attacks against in the monitoring post. A finding can be traced from exploit, to control violation, to alert, all in one system. That continuity is impossible if each post uses a different throwaway target.

**Four: real business-logic flaws, because that is the gap.** This is the rule that justifies building instead of downloading. The transfer feature has no check for a negative amount, no check for sufficient funds, and no lock against two requests racing the same balance. Those are the bugs a bank actually loses money to, and they are the bugs a generic target cannot teach.

## The thirteen flaws

Here is the full set, mapped to the OWASP Top 10 2021 category each belongs to. The deeper mapping, to SOC 2, ISO 27001, NIST 800-53, and PCI-DSS, is the entire subject of the next GRC post later in the series, so I'm keeping this table to the OWASP column for now.

| ID   | Vulnerability                                       | OWASP 2021                         |
| ---- | --------------------------------------------------- | ---------------------------------- |
| V-01 | SQL injection (auth bypass and data extraction)     | A03 Injection                      |
| V-02 | IDOR / broken object-level access                   | A01 Broken Access Control          |
| V-03 | Missing function-level authorization (admin)        | A01 Broken Access Control          |
| V-04 | Business logic: negative transfer, overdraft, race  | A04 Insecure Design                |
| V-05 | Plaintext card data and unsalted MD5 passwords      | A02 Cryptographic Failures         |
| V-06 | Broken auth: no lockout, predictable reset token    | A07 Identification & Auth Failures |
| V-07 | Missing anti-CSRF token on transfers                | A01 Broken Access Control          |
| V-08 | Stored XSS in transaction memo and profile bio      | A03 Injection                      |
| V-09 | Server-side request forgery (avatar import)         | A10 SSRF                           |
| V-10 | Path traversal / arbitrary file read                | A01 Broken Access Control          |
| V-11 | Misconfig: debug-console RCE, weak keys, no headers | A05 Security Misconfiguration      |
| V-12 | Mass assignment / privilege escalation              | A08 Software & Data Integrity      |
| V-13 | Broken JWT verification (alg:none, weak secret)     | A02 Cryptographic Failures         |

The rest of this post is not all thirteen. It is the handful that tell the best story.

## SQL injection, and the tool that said no

The login form builds its query by gluing strings together:

```sql
SELECT * FROM users WHERE username = '<input>' AND password_md5 = '<hash>'
```

So a username of `admin' -- ` closes the string, names the admin account, and comments out the entire password check. The app hands me an admin session without a password. Below in the screenshot `%27` is url-encoded of `'` .

![](../assets/Screenshot%202026-06-22%20165338.jpg)
![](../assets/Screenshot%202026-06-22%20165423.jpg)
_Figure 3. Logging in as admin with the password check commented out. The username field is the whole exploit._

Push a single quote into the field ( `'` ) on its own and the app does something almost as bad - it catches the database error and prints it, raw query, straight to the page. That is a second flaw (verbose errors) handing me a free map of the backend.

![](../assets/Screenshot%202026-07-10%20171327.jpg)
Figure 4. One stray quote, and the app prints its own SQL back to me.

That raw query is the whole map. It ends in `AND password_md5 = '...'`, which tells me exactly what to comment out. I pointed sqlmap, the standard automated SQL-injection tool, at this login to confirm the shape of it, and it flagged the `username` parameter across three separate techniques - boolean-based blind, time-based blind, and a nine-column UNION — then dumped the `users` table outright.

![](../assets/Screenshot%202026-07-10%20172909.jpg)
![](../assets/Screenshot%202026-07-10%20172930.jpg)
Figure 5. sqlmap confirms it three ways and pulls the user table.

So the tool and I agree the bug is real. But there is a thing regarding what the automated confirmation does and does not teach, because the interesting part: _how_ you read the answer out when the page shows you nothing... The login query never echoes data onto the page, and a wrong password and a wrong-but-injected condition both land you on the same "invalid credentials" form. There is no visible difference to read. The signal that actually separates a true condition from a false one here is not on the page at all - it is the code of HTTP. A successful login redirects (302), a failed one returns the form (200). So that's it - sqlmap found and used it. Below you can see the command I used for sqlmap to get the password hashes.

```bash
sqlmap -u "http://10.10.20.10:5000/login" \ --data="username=a&password=x" -p username \ --dbms=sqlite --technique=B \ --code=302 --ignore-redirects \ --level=5 --risk=3 --flush-session --batch \ --threads=10 --dump -T users -C "username,password_md5"
```

Here is what sqlmap gave as an output after running the command above.

![](../assets/Screenshot%202026-06-22%20154537.jpg)
Figure 6. Sqlmap output of password hashes for users

And because the app stores passwords as unsalted MD5, the weak ones fall instantly to a wordlist. The admin's password was strong enough to survive; the customer accounts were not.

![](../assets/Screenshot%202026-07-10%20174548%201.jpg)
_Figure 7. John the Ripper turning the stolen hashes back into passwords._

The lesson I'm taking into the write-up: a scanner saying "not injectable" is not the same as "safe." A real, fully exploitable blind SQL injection was behind clean automated report. Tools find the easy ones; the query shape here hid the tell, and only reading the status codes and the responses surfaced it.

## The card data is just displayed there

The card numbers and CVVs are stored in plain text, and the app shows them in full, with no masking.

![](../assets/Screenshot%202026-07-10%20175026.jpg)
_Figure 8. Full card number and CVV, rendered to the page. A real bank masks all but the last four for exactly this reason._

The JSON API makes it worse. Its account endpoint returns any account by its numeric ID, with no check that the account belongs to whoever is asking. So with one valid token I can walk the IDs and pull every customer's card, in clean machine-readable JSON.

![](../assets/Screenshot%202026-07-10%20175433.jpg)
_Figure 9. Asking the API for an account that isn't mine, and getting its card data back without any issues. Broken access control and plaintext storage in one response._

## The admin panel has no lock

The admin page checks that you are logged in. It never checks that you are an admin. Any customer who simply types `/admin` into the address bar gets the staff console, including the ability to set any account's balance to any number.

![](../assets/Screenshot%202026-07-13%20143052.jpg)
_Figure 10. A regular customer looking at the admin panel. The only thing protecting it was that nobody thought to ask for it._

## The bug a scanner will never find

This is the one that justified building the whole thing. The transfer feature debits the sender and credits the receiver, and it validates none of the business rules. So I transferred a **negative** amount to another account, and the arithmetic ran in reverse: the money moved out of the destination and into mine. Every request was well-formed. Nothing was injected. The app did exactly what the code said, and the code said something a bank can never allow.


![](../assets/Screenshot%202026-07-13%20143338.jpg)
![](../assets/Screenshot%202026-07-13%20143424.jpg)
_Figure 11. A transfer of minus five thousand. The balances before and after show the money flowing the wrong way. Tool does not reports this, because nothing is malformed so this is business logic flaw._

The same gap lets a transfer exceed the sender's balance (no funds check), and lets two simultaneous transfers both read the same starting balance before either writes (a race). These are the flaws that cost real money, and they are exactly what a generic target cannot model.

## SSRF, and a callback to Phase 0

The "import avatar from a URL" feature fetches whatever address I give it, from the server, with no allowlist. This is server-side request forgery. I can make the web server make requests on my behalf. Pointed at another machine in the DMZ, it works.

![](../assets/Screenshot%202026-07-13%20144127.jpg)
![](../assets/Screenshot%202026-07-13%20144156.jpg)
_Figure 12. The server fetching a URL I chose. From the outside I can't reach that host; through the server, I can._

Then I pointed it at the domain controller on the trusted LAN, `10.10.10.10`. It hangs and times out. That timeout is not a bug. It is the segmentation wall from Phase 0 doing its job - the DMZ can't open a connection into the LAN, so even with a SSRF the blast radius stops at the firewall. The app is wide open, and the network still contained it.

![](../assets/Screenshot%202026-07-13%20144300.jpg)
![](../assets/Screenshot%202026-07-13%20155728.jpg)
_Figure 13. The same attack aimed at the trusted LAN. It times out, because the Phase 0 rule blocks DMZ-to-LAN. The application flaw is real - the network limited where it could go._

<div class="callout callout-ok">
This is the whole reason the series is built in this order. One control failing (in our case it is the app) is caught by another control holding (the network). Defense in depth - is a screenshot of a timeout.
</div>

## It logs everything I just did

While I was attacking, the app was writing a JSON line for every security event. The sqlmap run shows up as a flood of failed logins from one address. The blind extraction shows up as hundreds of login attempts with SQL keywords in the username. The negative transfer, the admin access by a non-admin, the SSRF fetch, all of it is recorded.

![](../assets/Screenshot%202026-07-13%20155501.jpg)
_Figure 14. The security log filling up as I attack. This is the raw material for the detection phase, where these same events become alerts._

So this file is the bridge to the monitoring post later in the series. Every attack in this post is something I will detect in that one.

## Why this matters outside a lab

Nothing of these are exotic. They are the boring, common, expensive ones, and the frameworks name them directly. Plaintext card data is a PCI-DSS failure on its own. Broken access control is the number 1 item on the OWASP Top 10 two editions running. The unsalted MD5 storage is a textbook cryptographic-failure finding.

I'm not going to do the full control mapping here, because that is its own post. The point for now is that a custom target lets me produce findings that map cleanly onto real controls, with the actual vulnerable line of code on one side and the violated control on the other. You cannot do that honestly with a black-box demo app you didn't write.

## What this app does not prove

Honest limits, same as last time:

- **It is not a real bank.** It is small, the data is fake, and some realism is sacrificed for clarity. The flaws are real; the scale is not.
- **A planted vulnerability is not the same as a discovered one.** I knew where the bugs were because I put them there. The skill of finding them in code I didn't write is a different muscle, and a self-built target only partly exercises it.
- **One app is one data point.** Thirteen flaws in one Flask service is a teaching set, not a survey of how real fintech breaks.
- **Building the target is not the same as securing it.** Writing the vulnerable version is the easy half. The remediation, and proving the fix holds, is the work the later posts have to actually show.

## What's next

The findings from this post feed straight into the next two. The GRC post takes each of these thirteen flaws and maps it onto SOC 2, ISO 27001, NIST 800-53, and PCI-DSS controls, with the vulnerable code and the failing control side by side. The detection post takes the security log this app produced under attack and turns those events into rules. The business-logic flaws may also get their own deep dive, because they are the rarest and least-written-about of the set.

The app exists, it bleeds when you cut it, and it records the cut. That is exactly what the rest of the series needs.

## Takeaways

- Generic vulnerable apps teach the textbook web bugs well, but they cannot teach business-logic flaws, which is the category that actually moves money in a bank.
- Build the target so each flaw is one marked, single-line sink, so the fixed version is one diff away and the before-and-after is real.
- Make a vulnerable app log its own security events. A target you can attack but never detect only teaches half the lesson.
- A scanner reporting "not injectable" is not proof of safety. The SQL injection here was fully exploitable; the tool just wasn't looking at the right signal.
- One application reused across attack, compliance, and detection lets a single finding be traced end to end, which is impossible with throwaway targets.

## Gotchas

* sqlmap called the login "not injectable" while a real blind SQL injection sat right there. The cause was the query shape: a trailing `AND password_md5 = '...'` made the tool's true and false tests return the same page, and the only thing that actually distinguished true from false was the HTTP status code (302 vs 200), which its default body comparison wasn't keying on. Lesson confirmed: when a tool says no, read the code and the raw responses before you believe it.
* The session cookie is `HttpOnly`, so the stored XSS cannot read it with `document.cookie`. That does not make the XSS harmless. It can still drive a transfer with `fetch()` from inside the victim's session, so the impact is action-on-behalf, not cookie theft. Worth scoring honestly rather than reflexively calling every XSS a session hijack.
* The CSRF flaw is the missing anti-CSRF token, not the cookie policy. With `SameSite=Lax` over plain HTTP, a browser already withholds the cookie on a cross-site POST, so a clean cross-site proof needs TLS plus `SameSite=None`. The token-absence is the always-true finding; the SameSite angle is conditional.

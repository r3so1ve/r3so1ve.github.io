---
layout: default
title: Security Forge
---

# <span class="sf-red">Security</span> <span class="sf-white">Forge</span>

Welcome! I am Artur and write about:
- Web Pentesting
- Active Directory Security
- Network Analysis
- Vulnerability Research



## Latest posts
<ul>
  {% for post in site.posts limit:5 %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      — <small>{{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
  {% endfor %}
</ul>

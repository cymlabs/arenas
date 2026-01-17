# Culture Minds 360 - Page Structure

## 1. Main Pages

### Landing Page (`/`)
- Hero section with animated gradient
- Featured topics carousel
- Top voices preview
- Quick stats overview
- CTA to dashboard

### Dashboard (`/dashboard`)
- KPI cards row
- Main visualization panel (Bubbles, Treemap, Stream, Flow, 3D, Table)
- Trending topics sidebar
- Top voices sidebar
- Activity feed
- Cluster attraction panel
- **Fixed bottom nav for viz mode switching**

---

## 2. Entity Pages

### Topics Hub (`/topics`)
- **Includes holographic map** (half height, expandable)
- Topic categories grid
- Trending topics list
- Topic search
- Featured controversies section

### Individual Topic Page (`/topics/[id]`)
- **Includes holographic map** showing geographic distribution
- Topic header with stats
- Sentiment timeline chart
- Related voices section
- Connected topics graph
- Recent mentions feed
- Audience breakdown

---

### Voices/People Hub (`/voices`)
- Top voices leaderboard
- Voice categories tabs (Commentators, Politicians, Influencers)
- Search voices
- Featured voice spotlight
- **NO MAP** (not geographic)

### Individual Voice/Person Page (`/voices/[id]`)
- Profile header with avatar, bio, social links
- Key metrics cards (reach, engagement, sentiment)
- Topic association chart
- Audience demographics
- Activity timeline
- Connected voices network
- **NO MAP** (person-focused)

---

### Narratives Hub (`/narratives`)
- **Includes holographic map** (showing narrative spread)
- Active narratives list
- Narrative comparison tool
- Trending keywords
- Historical narrative timeline

### Individual Narrative Page (`/narratives/[id]`)
- **Includes holographic map** (geographic spread)
- Narrative overview
- Key voices driving narrative
- Topic connections
- Timeline of evolution
- Counter-narratives section

---

### Regions Hub (`/regions`)
- **Includes holographic map** (FULL HEIGHT - main feature)
- Region cards grid
- Regional topic comparison
- Country spotlights

### Individual Region Page (`/regions/[id]`)
- **Includes holographic map** (focused on region)
- Regional overview stats
- Top topics in region
- Key voices in region
- Sentiment comparison to global

---

## 3. Analytics Pages

### Trends (`/trends`)
- Momentum stream chart
- Emerging topics
- Declining topics
- Weekly/monthly comparisons
- **NO MAP** (data-focused)

### Compare (`/compare`)
- Side-by-side topic/voice comparison
- Overlap analysis
- Timeline comparison
- **NO MAP** (comparison-focused)

---

## 4. Account Pages

### Settings (`/settings`)
- Account preferences
- Notification settings
- Theme options
- **NO MAP**

### Profile (`/profile`)
- User profile
- Saved topics/voices
- Custom dashboards
- **NO MAP**

---

## Page Layout Guidelines

### With Map (Half Height)
- Topics hub
- Individual topic pages
- Narratives hub
- Individual narrative pages

### With Map (Full Height)
- Regions hub
- Individual region pages

### Without Map
- Dashboard (has 3D viz instead)
- Voices hub
- Individual voice pages
- Trends
- Compare
- Settings
- Profile
- Landing

---

## Common Components Per Page

### All Pages
- Premium navigation (top)
- Fixed bottom nav (on dashboard)
- Animated gradient mesh background
- Premium card styling

### Entity List Pages (Hubs)
- Search bar
- Filter tabs
- Sortable grid/list
- Featured spotlight section

### Individual Entity Pages
- Breadcrumb navigation
- Header with key stats
- Related entities section
- Activity/mentions feed
- Connected graph visualization

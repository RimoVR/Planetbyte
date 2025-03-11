# PlanetByte Technical Context

## Technologies Used

### Frontend Technologies

#### Core Game Engine
- **Phaser 3**: Primary framework for the 2D game canvas
  - Provides robust 2D rendering capabilities
  - Handles sprite management and animation
  - Offers built-in physics systems (though we use custom physics for multiplayer)
  - Supports multiple input methods (keyboard, mouse, touch, gamepad)

#### UI Framework
- **React**: Component-based UI library for elements outside the game canvas
  - Manages menus, settings, and non-gameplay interfaces
  - Provides responsive design for different screen sizes
  - Integrates with the game canvas through refs

#### Language & Type Safety
- **TypeScript**: Strongly-typed superset of JavaScript
  - Ensures type safety across the codebase
  - Improves developer experience with better tooling
  - Facilitates code organization and maintainability
  - Enables better IDE support and error detection

#### Asset Management
- **Asset Pipeline**: Custom asset management system
  - Handles sprite sheets and texture atlases
  - Manages audio assets with compression for web delivery
  - Implements progressive loading for game assets

### Backend Technologies

#### Game Server
- **Colyseus.js**: Multiplayer game server framework for Node.js
  - Provides room-based architecture for game instances
  - Handles WebSocket connections and state synchronization
  - Offers built-in room and state management

#### Runtime Environment
- **Node.js**: JavaScript runtime for server-side code
  - Powers the game server and API endpoints
  - Provides asynchronous I/O for handling many concurrent connections
  - Shares language with frontend for code reuse

#### State Management
- **Redis**: In-memory data structure store
  - Used for fast state management and caching
  - Provides pub/sub messaging for real-time communication
  - Handles session management and temporary data

#### Persistence
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database for persistent storage
  - Authentication services for user management
  - Storage functionality for asset hosting
  - Real-time subscriptions for data changes

### Infrastructure & Deployment

#### Frontend Hosting
- **Vercel**: Cloud platform for static sites and serverless functions
  - Hosts the React/TypeScript UI and static game assets
  - Provides global CDN for fast content delivery
  - Offers continuous deployment from Git

#### Backend Hosting
- **DigitalOcean App Services**: Platform-as-a-Service for application deployment
  - Hosts the Colyseus.js game server
  - Provides scalable infrastructure for the multiplayer backend
  - Offers managed environment for Node.js applications

#### Security & Performance
- **Cloudflare**: CDN and security services
  - Provides DDoS protection for the application
  - Offers additional CDN capabilities for asset delivery
  - Implements security features like WAF and bot protection

## Development Setup

### Local Development Environment

#### Prerequisites
- Node.js (v16+)
- npm or yarn
- Git
- Redis (local instance for development)
- PostgreSQL (local instance or Supabase project)

#### Frontend Setup
```bash
# Clone repository
git clone https://github.com/planetbyte/planetbyte-client.git
cd planetbyte-client

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Backend Setup
```bash
# Clone repository
git clone https://github.com/planetbyte/planetbyte-server.git
cd planetbyte-server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Development Workflow

#### Code Organization
- **Feature-based Structure**: Code organized by feature rather than type
- **Modular Architecture**: Clear separation between components
- **Shared Types**: Common type definitions shared between client and server

#### Version Control
- **Git Flow**: Feature branches, development branch, and main branch
- **Pull Requests**: Code review process for all changes
- **Continuous Integration**: Automated testing on pull requests

#### Testing Strategy
- **Unit Tests**: For core game logic and utilities
- **Integration Tests**: For API endpoints and server functionality
- **Playtesting**: Regular sessions for gameplay feedback

## Technical Constraints

### Performance Targets

#### Client-Side Performance
- **Frame Rate**: Minimum 60 FPS on modern mobile devices
- **Loading Time**: Initial load under 5 seconds on 4G connections
- **Memory Usage**: Maximum 256MB RAM usage on mobile devices

#### Server-Side Performance
- **Player Capacity**: Up to 10,000 concurrent players per server
- **Latency**: Maximum 50ms latency for responsive gameplay
- **Bandwidth**: Optimized for good 4G connections (limiting packet size and update frequency)

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: Chrome for Android, Safari for iOS
- **WebGL Support**: Required for game rendering
- **WebSocket Support**: Required for real-time communication

### Network Considerations
- **Connection Quality**: Designed to handle varying connection qualities
- **Reconnection Handling**: Graceful handling of temporary disconnections
- **Bandwidth Usage**: Optimized for mobile data plans

## Dependencies

### Frontend Dependencies

#### Core Dependencies
- Phaser 3: Game engine
- React: UI framework
- TypeScript: Programming language
- colyseus.js: Client library for Colyseus

#### Development Dependencies
- Vite: Build tool and development server
- ESLint: Code linting
- Prettier: Code formatting
- Jest: Testing framework

### Backend Dependencies

#### Core Dependencies
- Node.js: Runtime environment
- Colyseus: Multiplayer game server framework
- Redis: In-memory data store
- @supabase/supabase-js: Supabase client

#### Development Dependencies
- TypeScript: Programming language
- nodemon: Development server with auto-reload
- Jest: Testing framework
- SuperTest: HTTP testing library

## MCP Integration

PlanetByte leverages several Model Context Protocol (MCP) servers to enhance development capabilities:

### Sequential Thinking MCP Server
- **Purpose**: Facilitates complex problem-solving through structured thinking
- **Key Features**:
  - Breaking down complex problems into manageable steps
  - Revising and refining thoughts as understanding deepens
  - Branching into alternative paths of reasoning
  - Adjusting the total number of thoughts dynamically

### GitHub MCP Server
- **Purpose**: Enables Git operations, repository management, and code search
- **Key Features**:
  - File operations (create, update, read)
  - Repository management (create, fork, branch)
  - Issue and PR handling
  - Code search capabilities

### Brave Search MCP Server
- **Purpose**: Provides web and local search capabilities
- **Key Features**:
  - Web search with pagination and filtering
  - Local search for businesses and services
  - Automatic fallback from local to web search when needed

### Supabase MCP Server
- **Purpose**: Enables database operations through natural language
- **Key Features**:
  - SQL query execution
  - Database schema exploration
  - Data manipulation operations

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────┐
│             Internet                │
└───────────────────┬─────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│           Cloudflare CDN            │
│      (DDoS Protection, Caching)     │
└───────────────────┬─────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Vercel (CDN)   │     │  DigitalOcean   │
│  Frontend Host  │     │  App Services   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
         │                       ▼
         │             ┌─────────────────┐
         │             │   Game Server   │
         │             │  (Colyseus.js)  │
         │             └────────┬────────┘
         │                      │
         │                      │
         │                      ▼
         │             ┌─────────────────┐
         │             │      Redis      │
         │             │  (State Mgmt)   │
         │             └────────┬────────┘
         │                      │
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
          ┌─────────────────┐
          │    Supabase     │
          │ (Auth, DB, CDN) │
          └─────────────────┘
```

### Scaling Strategy

#### Horizontal Scaling
- **Game Servers**: Add more instances as player count increases
- **Redis Cluster**: Scale Redis nodes for increased throughput
- **Database Sharding**: Implement if needed for very high player counts

#### Regional Deployment
- **Multiple Regions**: Deploy to multiple geographic regions
- **Player Routing**: Route players to closest region
- **Cross-Region Communication**: For global game state and events

## Security Considerations

### Authentication & Authorization
- **Discord OAuth2**: Primary authentication method
- **JWT Tokens**: For session management
- **Role-Based Access**: For administrative functions

### Game Security
- **Server Authority**: All critical game logic runs server-side
- **Input Validation**: Thorough validation of all client inputs
- **Rate Limiting**: Prevent abuse of game mechanics

### Infrastructure Security
- **DDoS Protection**: Via Cloudflare
- **Encryption**: TLS for all communications
- **Regular Updates**: Keep all dependencies updated
- **Vulnerability Scanning**: Regular security scans
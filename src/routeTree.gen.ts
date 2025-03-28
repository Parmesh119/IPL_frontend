/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AppRouteImport } from './routes/app/route'
import { Route as IndexImport } from './routes/index'
import { Route as AuthRegisterImport } from './routes/auth/register'
import { Route as AuthLoginImport } from './routes/auth/login'
import { Route as AppTeamsIndexImport } from './routes/app/teams/index'
import { Route as AppPlayersIndexImport } from './routes/app/players/index'
import { Route as AppDashboardIndexImport } from './routes/app/dashboard/index'

// Create/Update Routes

const AppRouteRoute = AppRouteImport.update({
  id: '/app',
  path: '/app',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AuthRegisterRoute = AuthRegisterImport.update({
  id: '/auth/register',
  path: '/auth/register',
  getParentRoute: () => rootRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  id: '/auth/login',
  path: '/auth/login',
  getParentRoute: () => rootRoute,
} as any)

const AppTeamsIndexRoute = AppTeamsIndexImport.update({
  id: '/teams/',
  path: '/teams/',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppPlayersIndexRoute = AppPlayersIndexImport.update({
  id: '/players/',
  path: '/players/',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppDashboardIndexRoute = AppDashboardIndexImport.update({
  id: '/dashboard/',
  path: '/dashboard/',
  getParentRoute: () => AppRouteRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/app': {
      id: '/app'
      path: '/app'
      fullPath: '/app'
      preLoaderRoute: typeof AppRouteImport
      parentRoute: typeof rootRoute
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/auth/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof rootRoute
    }
    '/auth/register': {
      id: '/auth/register'
      path: '/auth/register'
      fullPath: '/auth/register'
      preLoaderRoute: typeof AuthRegisterImport
      parentRoute: typeof rootRoute
    }
    '/app/dashboard/': {
      id: '/app/dashboard/'
      path: '/dashboard'
      fullPath: '/app/dashboard'
      preLoaderRoute: typeof AppDashboardIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/players/': {
      id: '/app/players/'
      path: '/players'
      fullPath: '/app/players'
      preLoaderRoute: typeof AppPlayersIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/teams/': {
      id: '/app/teams/'
      path: '/teams'
      fullPath: '/app/teams'
      preLoaderRoute: typeof AppTeamsIndexImport
      parentRoute: typeof AppRouteImport
    }
  }
}

// Create and export the route tree

interface AppRouteRouteChildren {
  AppDashboardIndexRoute: typeof AppDashboardIndexRoute
  AppPlayersIndexRoute: typeof AppPlayersIndexRoute
  AppTeamsIndexRoute: typeof AppTeamsIndexRoute
}

const AppRouteRouteChildren: AppRouteRouteChildren = {
  AppDashboardIndexRoute: AppDashboardIndexRoute,
  AppPlayersIndexRoute: AppPlayersIndexRoute,
  AppTeamsIndexRoute: AppTeamsIndexRoute,
}

const AppRouteRouteWithChildren = AppRouteRoute._addFileChildren(
  AppRouteRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/app': typeof AppRouteRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/dashboard': typeof AppDashboardIndexRoute
  '/app/players': typeof AppPlayersIndexRoute
  '/app/teams': typeof AppTeamsIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/app': typeof AppRouteRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/dashboard': typeof AppDashboardIndexRoute
  '/app/players': typeof AppPlayersIndexRoute
  '/app/teams': typeof AppTeamsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/app': typeof AppRouteRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/dashboard/': typeof AppDashboardIndexRoute
  '/app/players/': typeof AppPlayersIndexRoute
  '/app/teams/': typeof AppTeamsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/app'
    | '/auth/login'
    | '/auth/register'
    | '/app/dashboard'
    | '/app/players'
    | '/app/teams'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/app'
    | '/auth/login'
    | '/auth/register'
    | '/app/dashboard'
    | '/app/players'
    | '/app/teams'
  id:
    | '__root__'
    | '/'
    | '/app'
    | '/auth/login'
    | '/auth/register'
    | '/app/dashboard/'
    | '/app/players/'
    | '/app/teams/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AppRouteRoute: typeof AppRouteRouteWithChildren
  AuthLoginRoute: typeof AuthLoginRoute
  AuthRegisterRoute: typeof AuthRegisterRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AppRouteRoute: AppRouteRouteWithChildren,
  AuthLoginRoute: AuthLoginRoute,
  AuthRegisterRoute: AuthRegisterRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/app",
        "/auth/login",
        "/auth/register"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/app": {
      "filePath": "app/route.tsx",
      "children": [
        "/app/dashboard/",
        "/app/players/",
        "/app/teams/"
      ]
    },
    "/auth/login": {
      "filePath": "auth/login.tsx"
    },
    "/auth/register": {
      "filePath": "auth/register.tsx"
    },
    "/app/dashboard/": {
      "filePath": "app/dashboard/index.tsx",
      "parent": "/app"
    },
    "/app/players/": {
      "filePath": "app/players/index.tsx",
      "parent": "/app"
    },
    "/app/teams/": {
      "filePath": "app/teams/index.tsx",
      "parent": "/app"
    }
  }
}
ROUTE_MANIFEST_END */

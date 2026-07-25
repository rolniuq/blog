---
title: "Building a Go SDK for the LINE Ads Platform API"
date: "2026-07-25"
excerpt: "When I needed to integrate LINE Ads into a Go service, there was no SDK available. So I built one — covering the full v3 API with JWS auth, OAuth2, and all the endpoints you'd expect."
coverImage: "/images/line-ads-sdk.svg"
tags: ["go", "sdk", "line", "ads", "open-source"]
---

# Building a Go SDK for the LINE Ads Platform API

## The Problem

I was building a Go service that needed to manage LINE Ads campaigns programmatically — create campaigns, manage custom audiences, pull performance data. Standard stuff for an advertising platform integration.

I went looking for a Go SDK. There wasn't one.

LINE provides a well-documented [REST API v3](https://ads.line.me/public-docs/v3/3.12.2/data-general-partner) with official SDKs for Python and Java. Go — one of the most popular languages for backend services — was left out. Every Go team integrating LINE Ads has to hand-roll the JWS signing, build their own request models, and map errors manually.

So I built it: [line-ads](https://github.com/rolniuq/line-ads).

## What It Is

`line-ads` is a **Go SDK for the LINE Ads Platform API v3**. It wraps every major API endpoint in idiomatic Go, handles authentication (both JWS and OAuth2), and provides strongly-typed DTOs so you never touch raw JSON.

```bash
go get github.com/rolniuq/line-ads@latest
```

## Authentication Done Right

LINE Ads uses two authentication mechanisms depending on which part of the API you're calling.

**LINE Ads API** uses **JWS (HMAC-SHA256)** — every request is signed with your access key and secret key. The SDK handles this transparently. You just pass your credentials when creating the service:

```go
svc := lineads.NewLineAdsService("your-access-key", "your-secret-key")
```

The `Authorization` header is built for you. Every request is signed with a compact JWS containing the SHA-256 digest of the body, content type, date, and URL path.

**Messaging API** uses **OAuth2 client credentials**. The SDK caches the token and auto-refreshes it within 60 seconds of expiry. No token management on your end.

## Full API Coverage

The SDK covers the entire LINE Ads Platform API v3:

| Category | Endpoints |
|----------|-----------|
| **Groups** | Get children, create child, update |
| **Ad Accounts** | List accounts in a group |
| **Link Requests** | Send, approve, cancel |
| **Campaigns** | CRUD + status management |
| **Ad Groups** | CRUD with page/size pagination |
| **Ads** | CRUD at the ad level |
| **Reference Codes** | Age, area, OS, advanced targeting |
| **ARS Simulation** | Budget/reach estimation |
| **Custom Audiences** | Full lifecycle + lookalike + overlap analysis |
| **Custom Conversions** | URL-based and event-based |
| **Tags** | LINE tag and tag event management |
| **Messaging API** | Push and multicast messages |

## Real Examples

### List Campaigns

```go
campaigns, err := svc.GetCampaigns(ctx, lineads.ReqGetCampaignsDto{
    AdAccountID: "A1",
})
for _, c := range campaigns.Datas {
    fmt.Printf("%s (%s)\n", c.Name, c.Status)
}
```

### Create a Campaign

```go
res, err := svc.CreateCampaign(ctx, lineads.ReqCreateCampaignDto{
    AdAccountID:       "A1",
    Name:              "Summer Sale",
    CampaignObjective: lineads.VISIT_WEBSITE,
    DailyBudget:       lineads.NewPointer(50000),
    StartDate:         "2026-08-01",
    EndDate:           "2026-08-31",
})
```

### Manage Custom Audiences

```go
// Create a web traffic audience
ca, _ := svc.CreateCustomAudience(ctx, lineads.ReqCreateCustomAudienceDto{
    Name:         "Site Visitors",
    FunctionType: lineads.CA_WEBTRAFFIC,
    WebTraffic: &lineads.WebTraffic{
        TagID:         "TAG123",
        VisitType:     lineads.VISIT_ALL,
        RetentionDays: 30,
        MatchingType:  lineads.MATCHING_NONE,
    },
})

// Build a lookalike
lookalike, _ := svc.CreateLookalike(ctx, lineads.ReqCreateLookalikeDto{
    Name: "Lookalike - Site Visitors",
    Lookalike: lineads.Lookalike{
        Source:     lineads.LookalikeSource{AudienceGroupID: ca.ID, Available: true},
        VolumeRate: lineads.VolumeRate{Auto: true, Rate: 0.01},
    },
})
```

### ARS Simulation (Reach Estimation)

```go
sim, _ := svc.SimulateArs(ctx, lineads.ReqSimulateArsDto{
    AdAccountID:       "A1",
    CampaignObjective: "VISIT_WEB",
    DailyBudgetMicro:  1000000,
    Targeting: &lineads.Targeting{
        Genders:   []string{"MALE", "FEMALE"},
        AgeGroups: []string{"AGE_20_24", "AGE_25_29"},
        Areas:     []lineads.GeoArea{{Code: "JP-13", Name: "Tokyo"}},
    },
})
fmt.Printf("Estimated daily reach: %v\n", sim.Reach)
```

### Send a LINE Message

```go
token := "your-oauth2-bearer-token"
msg := messenger.NewMessenger(config, &token)

resp, _ := msg.SendMessage(&messenger.SendMessageRequest{
    To:   "user-id",
    Messages: []messenger.Message{
        {Text: "Your ad campaign is live!", Type: "text"},
    },
})
```

## How It's Built

The SDK uses Go 1.22 generics extensively for type-safe API calls. The core is a generic `MakeRequest[T, U]` function that handles serialization, signing, HTTP, and deserialization in a single pipeline:

```go
func MakeRequest[T, U any](svc *LineAdsRequest[T], ...) (U, error)
```

Every API method is a thin wrapper that constructs the right DTO and calls `MakeRequest`. The result is strongly-typed responses with no `interface{}` or manual JSON parsing.

The error handling covers ~220 known LINE Ads API error reasons, defined as constants in `builder/errors.go`.

## Open Source

The project is [MIT licensed](https://github.com/rolniuq/line-ads/blob/master/LICENSE) and open for contributions. If you're working with LINE Ads in Go, give it a try — and feel free to open issues or PRs for anything missing.

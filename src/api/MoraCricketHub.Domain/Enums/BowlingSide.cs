using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Domain.Enums;

/// <summary>
/// Nullable on Delivery — only populated when commentary explicitly mentions it.
/// No innings-level coverage flag needed (unlike shot/direction data).
/// </summary>
public enum BowlingSide
{
    Over,
    Around,
}

using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Application.Common;

public static class EnumParser
{
    /// <summary>
    /// Parses enum values that arrive as SCREAMING_SNAKE_CASE strings.
    /// e.g. "PRE_TOSS_ABANDONED" → MatchStatus.PreTossAbandoned
    /// </summary>
    public static T Parse<T>(string value) where T : struct, Enum
        => Enum.Parse<T>(value.Replace("_", ""), ignoreCase: true);

    public static T? ParseNullable<T>(string? value) where T : struct, Enum
        => value is null ? null : Parse<T>(value);
}

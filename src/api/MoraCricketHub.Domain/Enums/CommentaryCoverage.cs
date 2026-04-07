using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Domain.Enums;

/// <summary>
/// How complete the shot/direction data is for an innings.
/// None  = no shot or direction data available from commentary
/// Key   = boundaries and wickets only have shot/direction
/// Full  = every delivery has shot/direction recorded
/// </summary>
public enum CommentaryCoverage
{
    None,
    Key,
    Full,
}

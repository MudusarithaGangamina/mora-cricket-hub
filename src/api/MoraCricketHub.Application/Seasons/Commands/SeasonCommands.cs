using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Seasons.Commands;

public record CreateSeasonCommand(
    string Name,
    string StartDate,
    string? EndDate
) : IRequest<Guid>;

public record UpdateSeasonCommand(
    Guid SeasonId,
    string Name,
    string StartDate,
    string? EndDate
) : IRequest<bool>;

using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Seasons.Queries;

public record SeasonDto(
    Guid Id,
    string Name,
    string StartDate,
    string? EndDate
);

public record GetAllSeasonsQuery : IRequest<List<SeasonDto>>;

public record GetSeasonByIdQuery(Guid SeasonId) : IRequest<SeasonDto?>;

using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Players.Interfaces;

namespace MoraCricketHub.Application.Players.Queries;

public class GetPlayerCareerStatsHandler
    : IRequestHandler<GetPlayerCareerStatsQuery, CareerStatsDto?>
{
    private readonly IPlayerRepository _repo;
    public GetPlayerCareerStatsHandler(IPlayerRepository repo) => _repo = repo;

    public Task<CareerStatsDto?> Handle(
        GetPlayerCareerStatsQuery request, CancellationToken ct)
        => _repo.GetCareerStatsAsync(request.PlayerId, ct);
}

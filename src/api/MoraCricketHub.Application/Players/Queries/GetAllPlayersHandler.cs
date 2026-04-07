using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Players.Interfaces;

namespace MoraCricketHub.Application.Players.Queries;

public class GetAllPlayersHandler
    : IRequestHandler<GetAllPlayersQuery, List<PlayerSummaryDto>>
{
    private readonly IPlayerRepository _repo;
    public GetAllPlayersHandler(IPlayerRepository repo) => _repo = repo;

    public Task<List<PlayerSummaryDto>> Handle(
        GetAllPlayersQuery request,
        CancellationToken cancellationToken)
        => _repo.GetAllAsync(request.ActiveOnly, cancellationToken);
}

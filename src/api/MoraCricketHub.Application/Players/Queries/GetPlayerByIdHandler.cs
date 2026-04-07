using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Players.Interfaces;

namespace MoraCricketHub.Application.Players.Queries;

public class GetPlayerByIdHandler
    : IRequestHandler<GetPlayerByIdQuery, PlayerDetailDto?>
{
    private readonly IPlayerRepository _repo;
    public GetPlayerByIdHandler(IPlayerRepository repo) => _repo = repo;

    public Task<PlayerDetailDto?> Handle(
        GetPlayerByIdQuery request,
        CancellationToken cancellationToken)
        => _repo.GetByIdAsync(request.PlayerId, cancellationToken);
}

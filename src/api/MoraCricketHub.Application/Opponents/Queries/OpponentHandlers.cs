using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Opponents.Interfaces;

namespace MoraCricketHub.Application.Opponents.Queries;

public class GetAllOpponentsHandler : IRequestHandler<GetAllOpponentsQuery, List<OpponentDto>>
{
    private readonly IOpponentRepository _repo;
    public GetAllOpponentsHandler(IOpponentRepository repo) => _repo = repo;
    public Task<List<OpponentDto>> Handle(GetAllOpponentsQuery r, CancellationToken ct)
        => _repo.GetAllAsync(ct);
}

public class GetOpponentByIdHandler : IRequestHandler<GetOpponentByIdQuery, OpponentDetailDto?>
{
    private readonly IOpponentRepository _repo;
    public GetOpponentByIdHandler(IOpponentRepository repo) => _repo = repo;
    public Task<OpponentDetailDto?> Handle(GetOpponentByIdQuery r, CancellationToken ct)
        => _repo.GetByIdAsync(r.OpponentId, ct);
}

using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Seasons.Interfaces;

namespace MoraCricketHub.Application.Seasons.Queries;

public class GetAllSeasonsHandler : IRequestHandler<GetAllSeasonsQuery, List<SeasonDto>>
{
    private readonly ISeasonRepository _repo;
    public GetAllSeasonsHandler(ISeasonRepository repo) => _repo = repo;

    public Task<List<SeasonDto>> Handle(
        GetAllSeasonsQuery request, CancellationToken ct)
        => _repo.GetAllAsync(ct);
}

public class GetSeasonByIdHandler : IRequestHandler<GetSeasonByIdQuery, SeasonDto?>
{
    private readonly ISeasonRepository _repo;
    public GetSeasonByIdHandler(ISeasonRepository repo) => _repo = repo;

    public Task<SeasonDto?> Handle(
        GetSeasonByIdQuery request, CancellationToken ct)
        => _repo.GetByIdAsync(request.SeasonId, ct);
}

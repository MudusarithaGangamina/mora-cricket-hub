using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Matches.Interfaces;

namespace MoraCricketHub.Application.Matches.Queries;

public class GetAllMatchesHandler
    : IRequestHandler<GetAllMatchesQuery, PagedMatchesDto>
{
    private readonly IMatchRepository _repo;
    public GetAllMatchesHandler(IMatchRepository repo) => _repo = repo;

    public Task<PagedMatchesDto> Handle(
        GetAllMatchesQuery request, CancellationToken ct)
        => _repo.GetAllAsync(request, ct);
}

public class GetMatchByIdHandler
    : IRequestHandler<GetMatchByIdQuery, MatchDetailDto?>
{
    private readonly IMatchRepository _repo;
    public GetMatchByIdHandler(IMatchRepository repo) => _repo = repo;

    public Task<MatchDetailDto?> Handle(
        GetMatchByIdQuery request, CancellationToken ct)
        => _repo.GetByIdAsync(request.MatchId, ct);
}

public class GetMatchSquadQueryHandler : IRequestHandler<GetMatchSquadQuery, List<SquadMemberDto>>
{
    private readonly IMatchRepository _matchRepository;

    public GetMatchSquadQueryHandler(IMatchRepository matchRepository)
    {
        _matchRepository = matchRepository;
    }

    public Task<List<SquadMemberDto>> Handle(
        GetMatchSquadQuery request,
        CancellationToken cancellationToken)
        =>_matchRepository.GetSquadAsync(request.MatchId, cancellationToken);
    
}

public class SetSquadCommandHandler : IRequestHandler<SetSquadCommand, bool>
{
    private readonly IMatchRepository _matchRepository;

    public SetSquadCommandHandler(IMatchRepository matchRepository)
    {
        _matchRepository = matchRepository;
    }

    public Task<bool> Handle(SetSquadCommand request, CancellationToken cancellationToken)
        =>_matchRepository.SetSquadAsync(request.MatchId, request.PlayerIds, cancellationToken);
    
}

public class SetOpponentSquadHandler
    : IRequestHandler<SetOpponentSquadCommand, bool>
{
    private readonly IMatchRepository _repo;
    public SetOpponentSquadHandler(IMatchRepository repo) => _repo = repo;

    public Task<bool> Handle(SetOpponentSquadCommand r, CancellationToken ct)
        => _repo.SetOpponentSquadAsync(r.MatchId, r.Entries, ct);
}

public record GetOpponentSquadQuery(Guid MatchId)
    : IRequest<List<OpponentSquadMemberDto>>;

public class GetOpponentSquadHandler
    : IRequestHandler<GetOpponentSquadQuery, List<OpponentSquadMemberDto>>
{
    private readonly IMatchRepository _repo;
    public GetOpponentSquadHandler(IMatchRepository repo) => _repo = repo;

    public Task<List<OpponentSquadMemberDto>> Handle(
        GetOpponentSquadQuery r, CancellationToken ct)
        => _repo.GetOpponentSquadAsync(r.MatchId, ct);
}
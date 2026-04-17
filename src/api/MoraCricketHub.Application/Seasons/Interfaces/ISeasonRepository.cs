using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Seasons.Queries;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Seasons.Interfaces;

public interface ISeasonRepository
{
    Task<List<SeasonDto>> GetAllAsync(CancellationToken ct);
    Task<SeasonDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Season?> FindByIdAsync(Guid id, CancellationToken ct);
    Task<Guid> CreateAsync(Season season, CancellationToken ct);
    Task<bool> UpdateAsync(Season season, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}

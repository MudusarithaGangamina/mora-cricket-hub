using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoraCricketHub.Application.Deliveries.Interfaces;
using MoraCricketHub.Application.Innings.Interfaces;
using MoraCricketHub.Application.Matches.Interfaces;
using MoraCricketHub.Application.Opponents.Interfaces;
using MoraCricketHub.Application.Players.Interfaces;
using MoraCricketHub.Application.Seasons.Interfaces;
using MoraCricketHub.Application.Tournaments.Interfaces;
using MoraCricketHub.Application.Venues.Interfaces;
using MoraCricketHub.Application.Dashboard.Interfaces;
using MoraCricketHub.Infrastructure.Persistence;
using MoraCricketHub.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(
                    typeof(AppDbContext).Assembly.FullName)
            ));

        // Repositories — add every new one here as you build them
        services.AddScoped<IPlayerRepository, PlayerRepository>();
        services.AddScoped<ISeasonRepository, SeasonRepository>();
        services.AddScoped<ITournamentRepository, TournamentRepository>();
        services.AddScoped<IVenueRepository, VenueRepository>();
        services.AddScoped<IOpponentRepository, OpponentRepository>();
        services.AddScoped<IMatchRepository, MatchRepository>();
        services.AddScoped<IInningsRepository, InningsRepository>();
        services.AddScoped<IDeliveryRepository, DeliveryRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();

        return services;
    }
}

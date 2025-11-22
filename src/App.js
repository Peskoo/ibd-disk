import React, { useState, useEffect } from 'react';
import { PolarGrid, PolarAngleAxis, RadarChart, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Save, History, TrendingUp } from 'lucide-react';

const App = () => {
  const [scores, setScores] = useState({
    douleurs_articulaires: 0,
    emotions: 0,
    sommeil: 0,
    energie: 0,
    relations: 0,
    education_travail: 0,
    douleurs_abdominales: 0,
    selles: 0,
    sexualite: 0,
    image_corporelle: 0
  });

  const [savedEvaluations, setSavedEvaluations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const items = [
    { key: 'douleurs_articulaires', label: 'Douleurs articulaires', color: '#FF6B6B', description: 'Mes articulations me font souffrir' },
    { key: 'emotions', label: 'Niveau de stress, Anxiété', color: '#4ECDC4', description: 'Je me suis senti(e) triste, mon moral a été bas, ou je me suis senti(e) déprimé(e) et/ou inquiet(ète) et/ou anxieux(euse)' },
    { key: 'sommeil', label: 'Sommeil', color: '#45B7D1', description: 'J\’ai eu des difficultés de sommeil, par exemple des problèmes d’endormissement, des réveils nocturnes fréquents ou des réveils très matinaux sans possibilité de rendormissement' },
    { key: 'energie', label: 'Énergie', color: '#FFA07A', description: 'Je ne me suis jamais senti(e) véritablement reposé(e), j\’ai manqué d’énergie, je me suis senti(e) fatigué(e)' },
    { key: 'relations', label: 'Vie social', color: '#98D8C8', description: 'J\’ai eu des difficultés dans ma relation aux autres et/ou des difficultés d’intégration' },
    { key: 'education_travail', label: 'Études/Travail', color: '#F7DC6F', description: 'J\’ai eu des difficultés dans mes activités professionnelles ou dans mes études ou dans la réalisation des tâches quotidiennes' },
    { key: 'douleurs_abdominales', label: 'Douleurs abdominales', color: '#BB8FCE', description: 'J\'’ai eu des douleurs au ventre ou à l\'’estomac' },
    { key: 'selles', label: 'Régulation de la défecation', color: '#85C1E2', description: 'J\’ai eu des selles urgentes que j’ai eu du mal à gérer; trouver des toilettes à temps a été un problème et j\’ai parfois eu des difficultés d\’essuyage/nettoyage' },
    { key: 'sexualite', label: 'Vie intime', color: '#F8B739', description: 'J\’ai eu des difficultés d\’ordre psychologique et/ou physique dans ma sexualité' },
    { key: 'image_corporelle', label: 'Image de soi', color: '#52B788', description: 'Je n\’aime pas mon corps ou certaines parties de mon corps' }
  ];

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      const result = await window.storage.list('ibd-eval:');
      if (result && result.keys) {
        const evals = await Promise.all(
          result.keys.map(async (key) => {
            const data = await window.storage.get(key);
            return data ? JSON.parse(data.value) : null;
          })
        );
        setSavedEvaluations(evals.filter(e => e !== null).sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        ));
      }
    } catch (error) {
      console.log('Première utilisation, aucune évaluation sauvegardée');
    }
    setIsLoading(false);
  };

  const handleScoreChange = (key, value) => {
    setScores(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const saveEvaluation = async () => {
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];
    const evaluation = {
      date: dateKey,
      scores: { ...scores },
      timestamp: today.toISOString()
    };

    try {
      await window.storage.set(`ibd-eval:${dateKey}`, JSON.stringify(evaluation));
      await loadEvaluations();
      alert('✅ Évaluation sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const loadEvaluation = (evaluation) => {
    setScores(evaluation.scores);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRadarData = (scoresData) => {
    return items.map(item => ({
      item: item.label,
      score: scoresData[item.key] || 0,
      fullMark: 10
    }));
  };

  const calculateAverage = (scoresData) => {
    const values = Object.values(scoresData);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-2">
            IBD Disk
          </h1>
          <p className="text-gray-600 mb-4">
            Évaluez l'impact de votre MICI sur votre vie quotidienne
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>Évaluation de la semaine écoulée</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Panel - Radar Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Visualisation</h2>
            <div className="mb-4 text-center">
              <div className="inline-block bg-indigo-100 rounded-lg px-4 py-2">
                <span className="text-sm text-gray-600">Score moyen: </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {calculateAverage(scores)}/10
                </span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={getRadarData(scores)}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="item" 
                  tick={{ fill: '#4b5563', fontSize: 11 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Interprétation:</strong> Plus le graphique est proche du centre, 
                meilleur est votre état de santé. L'objectif est de maintenir tous les 
                scores le plus près possible de 0.
              </p>
            </div>
          </div>

          {/* Right Panel - Score Inputs */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Évaluation (0 = pas du tout d'accord, 10 = tout à fait d'accord)
            </h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-700 text-sm">
                      {item.label}
                    </label>
                    <span 
                      className="text-2xl font-bold px-3 py-1 rounded-lg"
                      style={{ 
                        backgroundColor: `${item.color}20`,
                        color: item.color 
                      }}
                    >
                      {scores[item.key]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 italic">{item.description}</p>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={scores[item.key]}
                    onChange={(e) => handleScoreChange(item.key, e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${scores[item.key] * 10}%, #e5e7eb ${scores[item.key] * 10}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={saveEvaluation}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={20} />
              Sauvegarder cette évaluation
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <History size={24} />
              Historique des évaluations
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              {showHistory ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {showHistory && (
            <div>
              {savedEvaluations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune évaluation sauvegardée. Commencez par remplir votre première évaluation !
                </p>
              ) : (
                <div className="space-y-3">
                  {savedEvaluations.map((evaluation, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => loadEvaluation(evaluation)}
                    >
                      <div>
                        <div className="font-semibold text-gray-800">
                          {new Date(evaluation.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score moyen: {calculateAverage(evaluation.scores)}/10
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp 
                          size={20} 
                          className={calculateAverage(evaluation.scores) < 3 ? 'text-green-500' : 
                                    calculateAverage(evaluation.scores) < 6 ? 'text-yellow-500' : 
                                    'text-red-500'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 p-4">
          <p>IBD Disk - Outil d'évaluation pour les maladies inflammatoires de l'intestin</p>
          <p className="mt-2">
            Cet outil vous permet de suivre l'évolution de votre état de santé au fil du temps.
            Partagez vos résultats avec votre médecin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;

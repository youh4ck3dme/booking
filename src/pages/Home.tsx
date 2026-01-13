import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useServices } from '../hooks/useServices';

export const Home: React.FC = () => {
    const { data: services = [], isLoading } = useServices();

    const features = [
        {
            icon: Calendar,
            title: 'Jednoduché rezervácie',
            description: 'Rezervujte si termín v pár kliknutiach',
        },
        {
            icon: Clock,
            title: 'Real-time dostupnosť',
            description: 'Vidíte voľné termíny v reálnom čase',
        },
        {
            icon: Users,
            title: 'Výber zamestnanca',
            description: 'Vyberte si svojho obľúbeného špecialistu',
        },
        {
            icon: Sparkles,
            title: 'AI asistent',
            description: 'Chatbot vám pomôže s rezerváciou',
        },
    ];

    return (
        <div className="container py-xl">
            {/* Hero Section */}
            <motion.div
                className="text-center mb-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-md">
                    Rezervujte si termín{' '}
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                        okamžite
                    </span>
                </h1>
                <p className="text-lg text-secondary mb-xl max-w-2xl mx-auto">
                    Moderný booking systém pre rýchle a pohodlné rezervácie.
                    Bez čakania, bez telefonátov.
                </p>
                <div className="flex gap-md justify-center flex-wrap">
                    <Link to="/book">
                        <Button size="lg" rightIcon={<ArrowRight size={20} />}>
                            Rezervovať termín
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="secondary" size="lg">
                            Prihlásiť sa
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                className="grid grid-2 lg:grid-4 gap-lg mb-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    >
                        <Card hover>
                            <CardContent className="text-center p-lg">
                                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-md">
                                    <feature.icon size={24} className="text-white" />
                                </div>
                                <h3 className="font-bold mb-xs">{feature.title}</h3>
                                <p className="text-sm text-secondary">{feature.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Services Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <h2 className="text-3xl font-bold text-center mb-lg">Naše služby</h2>
                {isLoading ? (
                    <div className="flex justify-center py-xl">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-2 lg:grid-3 gap-lg">
                        {services.slice(0, 6).map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                            >
                                <Link to={`/book?service=${service.id}`}>
                                    <Card hover>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle>
                                                        {service.icon} {service.name}
                                                    </CardTitle>
                                                    <CardDescription>{service.description}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted">
                                                    <Clock size={14} className="inline mr-1" />
                                                    {service.duration} min
                                                </span>
                                                <span className="text-lg font-bold" style={{ color: service.color }}>
                                                    {service.price > 0 ? `${service.price}€` : 'Zdarma'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
                <div className="text-center mt-xl">
                    <Link to="/book">
                        <Button size="lg" variant="secondary">
                            Zobraziť všetky služby
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
                className="mt-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
            >
                <Card className="text-center p-xl" style={{ background: 'var(--gradient-primary)' }}>
                    <h2 className="text-3xl font-bold text-white mb-md">
                        Pripravení začať?
                    </h2>
                    <p className="text-white/90 mb-xl max-w-xl mx-auto">
                        Vytvorte si účet a získajte prístup k exkluzívnym funkciám,
                        histórii rezervácií a personalizovaným odporúčaniam.
                    </p>
                    <Link to="/login">
                        <Button size="lg" variant="secondary">
                            Prihlásiť sa / Registrovať
                        </Button>
                    </Link>
                </Card>
            </motion.div>
        </div>
    );
};

export default Home;
